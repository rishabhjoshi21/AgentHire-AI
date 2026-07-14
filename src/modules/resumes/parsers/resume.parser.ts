import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';

import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

import type { ParsedResume, ResumeLink } from '../resume.dto';
interface PdfAnnotation {
  subtype?: string;
  url?: string;
}
@Injectable()
export class ResumeParser {
  async extractText(filePath: string, mimeType: string): Promise<ParsedResume> {
    const buffer = await readFile(filePath);

    let content = '';
    let annotationLinks: string[] = [];

    switch (mimeType) {
      case 'application/pdf': {
        const pdfData = await this.extractPdf(buffer);

        content = pdfData.text;
        annotationLinks = pdfData.links;

        break;
      }

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        content = await this.extractDocx(buffer);

        break;
      }
    }

    content = this.cleanText(content);

    const textLinks = this.extractLinks(content);

    const pdfLinks = annotationLinks.map((url) => ({
      type: this.detectLinkType(url),
      url,
    }));

    return {
      content,

      metadata: {
        emails: this.extractEmails(content),

        phones: this.extractPhones(content),

        links: [...textLinks, ...pdfLinks],
      },
    };
  }

  private async extractPdf(buffer: Buffer): Promise<{
    text: string;
    links: string[];
  }> {
    const parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    const links = await this.extractPdfLinks(buffer);

    return {
      text: result.text,
      links,
    };
  }

  private async extractPdfLinks(buffer: Buffer): Promise<string[]> {
    const document = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
    }).promise;

    const links: string[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);

      const annotations = (await page.getAnnotations()) as PdfAnnotation[];

      annotations.forEach((annotation) => {
        if (
          annotation.subtype === 'Link' &&
          annotation.url &&
          !annotation.url.startsWith('mailto:')
        ) {
          links.push(annotation.url);
        }
      });
    }

    return links;
  }

  private async extractDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({
      buffer,
    });

    return result.value;
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  private extractEmails(text: string): string[] {
    return text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
  }

  private extractPhones(text: string): string[] {
    return text.match(/(\+?\d[\d\s-]{8,}\d)/g) ?? [];
  }

  private extractLinks(text: string): ResumeLink[] {
    const urls = text.match(/(https?:\/\/[^\s]+)/g) ?? [];

    return urls.map((url: string) => ({
      type: this.detectLinkType(url),
      url,
    }));
  }

  private detectLinkType(url: string): ResumeLink['type'] {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('linkedin')) {
      return 'linkedin';
    }

    if (lowerUrl.includes('github')) {
      return 'github';
    }

    if (
      lowerUrl.includes('portfolio') ||
      lowerUrl.includes('vercel') ||
      lowerUrl.includes('netlify')
    ) {
      return 'portfolio';
    }

    return 'other';
  }
}

import { GenerateResumeReviewRequest } from '../resume-review.dto';

export function buildResumeReviewPrompt(
  request: GenerateResumeReviewRequest,
): string {
  return `
You are provided with three inputs.

==================================================
ORIGINAL RESUME
==================================================

${request.resumeContent}

==================================================
TARGET JOB DESCRIPTION
==================================================

${request.jobDescription}

==================================================
ATS ANALYSIS
==================================================

${JSON.stringify(request.analysis, null, 2)}

==================================================
TASK
==================================================

Use the ATS analysis to understand the strengths and weaknesses of the resume.

Use the job description to identify important skills, technologies, and keywords.

Improve the resume while preserving factual accuracy.

Only include sections that require improvement.

If a section is already strong, omit it.

If an improvement would require inventing information, leave the meaning unchanged and instead provide a recommendation.

Return ONLY valid JSON matching the required schema.
`;
}

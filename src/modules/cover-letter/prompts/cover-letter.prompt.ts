import { GenerateCoverLetterRequest } from '../cover-letter.dto';

export function buildCoverLetterPrompt(
  request: GenerateCoverLetterRequest,
): string {
  return `
You are provided with three inputs.

==================================================
RESUME
==================================================

${request.resumeContent}

==================================================
JOB DESCRIPTION
==================================================

${request.jobDescription}

==================================================
ANALYSIS RESULT
==================================================

${JSON.stringify(request.analysis, null, 2)}

==================================================
TASK
==================================================

Generate a tailored cover letter for the candidate based on the resume, target job description, and analysis result.

Prioritize genuine areas of alignment between the candidate's experience and the job requirements.

Do not invent or exaggerate any candidate experience.

Return ONLY valid JSON matching this structure:

{
  "content": "Dear Hiring Manager,..."
}
`;
}

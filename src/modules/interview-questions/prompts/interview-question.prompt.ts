import { GenerateInterviewQuestionRequest } from '../interview-question.dto';

export function buildInterviewQuestionPrompt(
  request: GenerateInterviewQuestionRequest,
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

Generate realistic interview questions based on the candidate's experience and the target job.

Use the resume to understand the candidate's background.

Use the job description to identify important technologies, responsibilities, and expectations.

Use the analysis result to identify strengths, weaknesses, missing skills, and ATS gaps.

Generate grouped interview questions under the required categories.

Return ONLY valid JSON matching the required schema.
`;
}

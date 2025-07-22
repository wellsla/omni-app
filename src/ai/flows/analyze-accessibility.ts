
'use server';

/**
 * @fileOverview An AI-powered accessibility analysis flow.
 *
 * - analyzeAccessibility - A function that handles the accessibility analysis process.
 * - AnalyzeAccessibilityInput - The input type for the function.
 * - AnalyzeAccessibilityOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAccessibilityInputSchema = z.object({
  htmlCode: z.string().describe('The HTML code snippet to be analyzed.'),
});
export type AnalyzeAccessibilityInput = z.infer<typeof AnalyzeAccessibilityInputSchema>;

const AccessibilityIssueSchema = z.object({
  feature: z.string().describe("The specific element or attribute that has an accessibility issue."),
  recommendation: z.string().describe("A clear, actionable recommendation to fix the issue, explaining why it's important."),
});

const AnalyzeAccessibilityOutputSchema = z.object({
  issues: z.array(AccessibilityIssueSchema).describe('An array of potential accessibility issues found in the code.'),
  summary: z.string().describe('A 1-2 sentence summary of the overall accessibility of the HTML snippet.'),
});
export type AnalyzeAccessibilityOutput = z.infer<typeof AnalyzeAccessibilityOutputSchema>;

export async function analyzeAccessibility(input: AnalyzeAccessibilityInput): Promise<AnalyzeAccessibilityOutput> {
  return analyzeAccessibilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAccessibilityPrompt',
  input: {schema: AnalyzeAccessibilityInputSchema},
  output: {schema: AnalyzeAccessibilityOutputSchema},
  prompt: `You are an expert web accessibility analyst following WCAG guidelines. Your task is to analyze the provided HTML code snippet and identify potential accessibility issues.

Analyze the following HTML code:
\`\`\`html
{{htmlCode}}
\`\`\`

Check for common issues, including but not limited to:
1.  **Missing 'lang' attribute**: The \`<html>\` tag should have a 'lang' attribute.
2.  **Image alt text**: All \`<img>\` tags must have a descriptive 'alt' attribute.
3.  **Form labels**: All form inputs (\`<input>\`, \`<textarea>\`, \`<select>\`) should have an associated \`<label>\`.
4.  **Semantic HTML**: The document should use semantic landmarks like \`<main>\`, \`<nav>\`, and \`<header>\`.
5.  **Link text**: Links (\`<a>\` tags) should have descriptive text, not just "click here".
6.  **Color contrast**: (Conceptual check) Mention if there are potential issues if colors were defined, but you cannot see the CSS.
7.  **Heading structure**: Headings (\`<h1>\`, \`<h2>\`, etc.) should be used logically and not skip levels.

For each issue you find, provide the specific feature and a clear, actionable recommendation.

Return a JSON object with a list of issues and a brief overall summary. If there are no issues, return an empty 'issues' array and a positive summary.`,
});

const analyzeAccessibilityFlow = ai.defineFlow(
  {
    name: 'analyzeAccessibilityFlow',
    inputSchema: AnalyzeAccessibilityInputSchema,
    outputSchema: AnalyzeAccessibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Accessibility analysis failed to produce a result.");
    }
    return output;
  }
);

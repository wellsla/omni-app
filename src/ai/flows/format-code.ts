'use server';

/**
 * @fileOverview Formats a string of code for a given language.
 *
 * - formatCode - A function that handles the code formatting process.
 * - FormatCodeInput - The input type for the formatCode function.
 * - FormatCodeOutput - The return type for the formatCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatCodeInputSchema = z.object({
  code: z.string().describe('The raw code string to be formatted.'),
  language: z.string().describe('The programming language of the code (e.g., "JavaScript", "Python", "CSS").'),
});
export type FormatCodeInput = z.infer<typeof FormatCodeInputSchema>;

const FormatCodeOutputSchema = z.object({
  formattedCode: z.string().describe('The formatted code.'),
});
export type FormatCodeOutput = z.infer<typeof FormatCodeOutputSchema>;

export async function formatCode(input: FormatCodeInput): Promise<FormatCodeOutput> {
  return formatCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatCodePrompt',
  input: {schema: FormatCodeInputSchema},
  output: {schema: FormatCodeOutputSchema},
  prompt: `You are an expert code formatter. Your task is to format the following {{language}} code according to the standard conventions and best practices for that language.

- Ensure proper indentation, consistent spacing, and correct line breaks.
- Do not add, remove, or change any of the actual code logic. Only format it.
- Return only the formatted code, without any explanations, comments, or markdown code blocks (e.g. \`\`\`json).

Code to format:
{{code}}`,
});

const formatCodeFlow = ai.defineFlow(
  {
    name: 'formatCodeFlow',
    inputSchema: FormatCodeInputSchema,
    outputSchema: FormatCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview Converts a code snippet from one language to another.
 *
 * - convertCodeLanguage - A function that handles the code conversion process.
 * - ConvertCodeLanguageInput - The input type for the function.
 * - ConvertCodeLanguageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertCodeLanguageInputSchema = z.object({
  code: z.string().describe('The source code string to be converted.'),
  sourceLanguage: z.string().describe('The programming language of the source code (e.g., "JavaScript", "Python").'),
  targetLanguage: z.string().describe('The programming language to convert the code to (e.g., "Python", "Go").'),
});
export type ConvertCodeLanguageInput = z.infer<typeof ConvertCodeLanguageInputSchema>;

const ConvertCodeLanguageOutputSchema = z.object({
  convertedCode: z.string().describe('The converted code in the target language.'),
});
export type ConvertCodeLanguageOutput = z.infer<typeof ConvertCodeLanguageOutputSchema>;

export async function convertCodeLanguage(input: ConvertCodeLanguageInput): Promise<ConvertCodeLanguageOutput> {
  return convertCodeLanguageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'convertCodeLanguagePrompt',
  input: {schema: ConvertCodeLanguageInputSchema},
  output: {schema: ConvertCodeLanguageOutputSchema},
  prompt: `You are an expert programmer and code translator. Your task is to convert the following code snippet from {{sourceLanguage}} to {{targetLanguage}}.

- Translate the logic, syntax, and conventions as accurately as possible.
- Adhere to the best practices and idiomatic style of the target language.
- Do not add any explanations, comments, or markdown code blocks (e.g., \`\`\`python). Return only the raw translated code.

Source Code ({{sourceLanguage}}):
\`\`\`
{{code}}
\`\`\``,
});

const convertCodeLanguageFlow = ai.defineFlow(
  {
    name: 'convertCodeLanguageFlow',
    inputSchema: ConvertCodeLanguageInputSchema,
    outputSchema: ConvertCodeLanguageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

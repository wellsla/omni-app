'use server';

/**
 * @fileOverview Minifies a string of code for a given language.
 *
 * - minifyCode - A function that handles the code minification process.
 * - MinifyCodeInput - The input type for the minifyCode function.
 * - MinifyCodeOutput - The return type for the minifyCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MinifyCodeInputSchema = z.object({
  code: z.string().describe('The raw code string to be minified.'),
  language: z.enum(['javascript', 'css', 'html']).describe('The programming language of the code (JavaScript, CSS, or HTML).'),
});
export type MinifyCodeInput = z.infer<typeof MinifyCodeInputSchema>;

const MinifyCodeOutputSchema = z.object({
  minifiedCode: z.string().describe('The minified code.'),
});
export type MinifyCodeOutput = z.infer<typeof MinifyCodeOutputSchema>;

export async function minifyCode(input: MinifyCodeInput): Promise<MinifyCodeOutput> {
  return minifyCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'minifyCodePrompt',
  input: {schema: MinifyCodeInputSchema},
  output: {schema: MinifyCodeOutputSchema},
  prompt: `You are an expert code minifier. Your task is to minify the following {{language}} code.

- Remove all unnecessary characters like whitespace, newlines, and comments.
- For JavaScript, shorten variable and function names where possible without breaking the code's logic (uglification).
- Do not change the functionality of the code.
- Return only the raw minified code, without any explanations, comments, or markdown code blocks.

Code to minify:
\`\`\`{{language}}
{{code}}
\`\`\``,
});

const minifyCodeFlow = ai.defineFlow(
  {
    name: 'minifyCodeFlow',
    inputSchema: MinifyCodeInputSchema,
    outputSchema: MinifyCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Minification failed to produce a result.");
    }
    return output;
  }
);

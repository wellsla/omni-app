
'use server';

/**
 * @fileOverview A Lorem Ipsum text generation flow.
 *
 * - generateLoremIpsum - A function that generates placeholder text.
 * - GenerateLoremIpsumInput - The input type for the function.
 * - GenerateLoremIpsumOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLoremIpsumInputSchema = z.object({
  count: z.number().int().min(1).describe('The number of items to generate.'),
  type: z.enum(['words', 'sentences', 'paragraphs']).describe('The type of text unit to generate.'),
});
export type GenerateLoremIpsumInput = z.infer<typeof GenerateLoremIpsumInputSchema>;

const GenerateLoremIpsumOutputSchema = z.object({
  text: z.string().describe('The generated Lorem Ipsum text.'),
});
export type GenerateLoremIpsumOutput = z.infer<typeof GenerateLoremIpsumOutputSchema>;

export async function generateLoremIpsum(input: GenerateLoremIpsumInput): Promise<GenerateLoremIpsumOutput> {
  return generateLoremIpsumFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLoremIpsumPrompt',
  input: {schema: GenerateLoremIpsumInputSchema},
  output: {schema: GenerateLoremIpsumOutputSchema},
  prompt: `You are a Lorem Ipsum generator. Your task is to generate exactly {{count}} {{type}} of classic Lorem Ipsum text.

- Do not include any titles, headers, or explanations.
- If generating paragraphs, separate them with a double line break.
- Start the text directly with "Lorem ipsum dolor sit amet...".
- Return only the raw text.`,
});

const generateLoremIpsumFlow = ai.defineFlow(
  {
    name: 'generateLoremIpsumFlow',
    inputSchema: GenerateLoremIpsumInputSchema,
    outputSchema: GenerateLoremIpsumOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Lorem Ipsum generation failed to produce a result.");
    }
    return output;
  }
);

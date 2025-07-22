'use server';

/**
 * @fileOverview Finds font pairings based on a user's descriptive prompt.
 *
 * - findFontPairings - A function that handles the font pairing suggestion process.
 * - FindFontPairingsInput - The input type for the function.
 * - FindFontPairingsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindFontPairingsInputSchema = z.object({
  prompt: z.string().describe('A descriptive prompt for the desired font pairing style (e.g., "a modern, minimalist look for a tech blog").'),
});
export type FindFontPairingsInput = z.infer<typeof FindFontPairingsInputSchema>;

const FontPairingSchema = z.object({
  headlineFont: z.string().describe('The name of the font for headlines, e.g., "Montserrat".'),
  bodyFont: z.string().describe('The name of the font for body text, e.g., "Lato".'),
  description: z.string().describe('A brief explanation of why this pairing works and what mood it creates.'),
  googleFontsUrl: z.string().url().describe('The full Google Fonts URL to import both fonts with weights 400 and 700.'),
});

const FindFontPairingsOutputSchema = z.object({
  pairings: z.array(FontPairingSchema).describe('An array of 3-4 recommended font pairings.'),
});
export type FindFontPairingsOutput = z.infer<typeof FindFontPairingsOutputSchema>;


export async function findFontPairings(input: FindFontPairingsInput): Promise<FindFontPairingsOutput> {
  return findFontPairingsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'findFontPairingsPrompt',
  input: {schema: FindFontPairingsInputSchema},
  output: {schema: FindFontPairingsOutputSchema},
  prompt: `You are an expert typographer and UI designer. Based on the user's prompt, suggest 3-4 excellent font pairings from Google Fonts.

For each pairing:
1.  Provide the name of the headline font and the body font.
2.  Write a short, compelling description explaining why the pairing is effective for the user's described need.
3.  Construct a single, valid Google Fonts URL to import both fonts. The URL must include both regular (400) and bold (700) weights for each font. The format should be like: \`https://fonts.googleapis.com/css2?family=FONT_ONE:wght@400;700&family=FONT_TWO:wght@400;700&display=swap\`. Replace spaces in font names with plus signs (+).

User Prompt: "{{prompt}}"`,
});


const findFontPairingsFlow = ai.defineFlow(
  {
    name: 'findFontPairingsFlow',
    inputSchema: FindFontPairingsInputSchema,
    outputSchema: FindFontPairingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Font pairing generation failed to produce a result.");
    }
    return output;
  }
);

'use server';

/**
 * @fileOverview Generates a color scheme based on a user prompt.
 *
 * - generateColorScheme - A function that handles the color scheme generation.
 * - GenerateColorSchemeInput - The input type for the function.
 * - GenerateColorSchemeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateColorSchemeInputSchema = z.object({
  prompt: z.string().describe('A descriptive prompt for the desired color scheme (e.g., "a modern, calming theme for a meditation app").'),
});
export type GenerateColorSchemeInput = z.infer<typeof GenerateColorSchemeInputSchema>;

const ColorSchema = z.object({
  hex: z.string().describe('The hex code of the color, e.g., #RRGGBB.'),
  name: z.string().describe('A descriptive name for the color, e.g., "Serene Blue".'),
  usage: z.string().describe('A brief recommendation for where to use this color (e.g., "Primary Background", "Accent/CTA", "Text").'),
});

const GenerateColorSchemeOutputSchema = z.object({
  colors: z.array(ColorSchema).describe('An array of 5-7 colors that form a cohesive palette based on the prompt.'),
});
export type GenerateColorSchemeOutput = z.infer<typeof GenerateColorSchemeOutputSchema>;

export async function generateColorScheme(input: GenerateColorSchemeInput): Promise<GenerateColorSchemeOutput> {
  return generateColorSchemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateColorSchemePrompt',
  input: {schema: GenerateColorSchemeInputSchema},
  output: {schema: GenerateColorSchemeOutputSchema},
  prompt: `You are an expert UI/UX designer specializing in color theory. Based on the user's prompt, generate a cohesive color palette of 5-7 colors.

For each color, provide:
1.  A valid hex code.
2.  A creative and descriptive name.
3.  A recommended usage (e.g., "Primary Background", "Main Text", "Primary Accent", "Secondary Accent", "Highlight").

User Prompt: "{{prompt}}"`,
});

const generateColorSchemeFlow = ai.defineFlow(
  {
    name: 'generateColorSchemeFlow',
    inputSchema: GenerateColorSchemeInputSchema,
    outputSchema: GenerateColorSchemeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

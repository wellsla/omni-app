'use server';

/**
 * @fileOverview Extracts a color palette from an image.
 *
 * - extractColorsFromImage - A function that handles the color extraction process.
 * - ExtractColorsFromImageInput - The input type for the extractColorsFromImage function.
 * - ExtractColorsFromImageOutput - The return type for the extractColorsFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractColorsFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image to extract colors from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractColorsFromImageInput = z.infer<typeof ExtractColorsFromImageInputSchema>;

const ColorSchema = z.object({
    hex: z.string().describe('The hex code of the color, e.g., #RRGGBB.'),
    name: z.string().describe('A common name for the color, e.g., "Forest Green".'),
});

const ExtractColorsFromImageOutputSchema = z.object({
  colors: z.array(ColorSchema).describe('An array of 5-8 dominant colors from the image.'),
});
export type ExtractColorsFromImageOutput = z.infer<typeof ExtractColorsFromImageOutputSchema>;

export async function extractColorsFromImage(input: ExtractColorsFromImageInput): Promise<ExtractColorsFromImageOutput> {
  return extractColorsFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractColorsFromImagePrompt',
  input: {schema: ExtractColorsFromImageInputSchema},
  output: {schema: ExtractColorsFromImageOutputSchema},
  prompt: `You are a color expert. Analyze the provided image and identify a palette of 5-8 dominant and complementary colors. For each color, provide its hex code and a common, descriptive name.

Image: {{media url=imageDataUri}}`,
});

const extractColorsFromImageFlow = ai.defineFlow(
  {
    name: 'extractColorsFromImageFlow',
    inputSchema: ExtractColorsFromImageInputSchema,
    outputSchema: ExtractColorsFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

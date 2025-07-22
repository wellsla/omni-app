'use server';

/**
 * @fileOverview Removes the background from an image.
 *
 * - removeImageBackground - A function that handles the background removal process.
 * - RemoveImageBackgroundInput - The input type for the removeImageBackground function.
 * - RemoveImageBackgroundOutput - The return type for the removeImageBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveImageBackgroundInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image to remove the background from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveImageBackgroundInput = z.infer<typeof RemoveImageBackgroundInputSchema>;

const RemoveImageBackgroundOutputSchema = z.object({
  resultImageUri: z.string().describe('The resulting image as a data URI, typically a PNG with a transparent background.'),
});
export type RemoveImageBackgroundOutput = z.infer<typeof RemoveImageBackgroundOutputSchema>;

export async function removeImageBackground(input: RemoveImageBackgroundInput): Promise<RemoveImageBackgroundOutput> {
  return removeImageBackgroundFlow(input);
}

const removeImageBackgroundFlow = ai.defineFlow(
  {
    name: 'removeImageBackgroundFlow',
    inputSchema: RemoveImageBackgroundInputSchema,
    outputSchema: RemoveImageBackgroundOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.imageDataUri } },
        { text: 'Remove the background from this image. The main subject should be preserved. The output must be a PNG image with a transparent background.' },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });
    
    if (!media || !media.url) {
      throw new Error('Image generation failed to return a result.');
    }

    return { resultImageUri: media.url };
  }
);

'use server';

/**
 * @fileOverview Compresses an image.
 *
 * - compressImage - A function that handles the image compression process.
 * - CompressImageInput - The input type for the compressImage function.
 * - CompressImageOutput - The return type for the compressImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompressImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image to compress, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CompressImageInput = z.infer<typeof CompressImageInputSchema>;

const CompressImageOutputSchema = z.object({
  resultImageUri: z.string().describe('The resulting compressed image as a data URI, typically a WebP.'),
});
export type CompressImageOutput = z.infer<typeof CompressImageOutputSchema>;

export async function compressImage(input: CompressImageInput): Promise<CompressImageOutput> {
  return compressImageFlow(input);
}

const compressImageFlow = ai.defineFlow(
  {
    name: 'compressImageFlow',
    inputSchema: CompressImageInputSchema,
    outputSchema: CompressImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.imageDataUri } },
        { text: 'Compress this image as much as possible while preserving reasonable visual quality. The output format should be a WebP image.' },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });
    
    if (!media || !media.url) {
      throw new Error('Image compression failed to return a result.');
    }

    return { resultImageUri: media.url };
  }
);

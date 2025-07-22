'use server';

/**
 * @fileOverview Vectorizes a raster image into an SVG.
 *
 * - vectorizeImage - A function that handles the image vectorization process.
 * - VectorizeImageInput - The input type for the vectorizeImage function.
 * - VectorizeImageOutput - The return type for the vectorizeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VectorizeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A raster image to vectorize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VectorizeImageInput = z.infer<typeof VectorizeImageInputSchema>;

const VectorizeImageOutputSchema = z.object({
  resultImageUri: z.string().describe('The resulting vectorized image as a data URI, typically an SVG.'),
});
export type VectorizeImageOutput = z.infer<typeof VectorizeImageOutputSchema>;

export async function vectorizeImage(input: VectorizeImageInput): Promise<VectorizeImageOutput> {
  return vectorizeImageFlow(input);
}

const prompt = ai.definePrompt({
    name: 'vectorizeImagePrompt',
    input: { schema: z.object({ imageDataUri: z.string() }) },
    output: { schema: z.object({ svgContent: z.string().describe("The full content of the SVG file.") }) },
    prompt: `You are an expert image vectorization tool. Analyze the provided raster image and convert it into a Scalable Vector Graphic (SVG). The SVG should accurately represent the shapes, lines, and colors of the original image. The output must be only the raw SVG code, starting with "<svg..." and ending with "</svg>". Do not include any markdown or other text.

Image: {{media url=imageDataUri}}`
});


const vectorizeImageFlow = ai.defineFlow(
  {
    name: 'vectorizeImageFlow',
    inputSchema: VectorizeImageInputSchema,
    outputSchema: VectorizeImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output || !output.svgContent) {
        throw new Error('Image vectorization failed to return SVG content.');
    }
    
    // The model returns the raw SVG string. We need to wrap it in a data URI.
    const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(output.svgContent).toString('base64')}`;
    
    return { resultImageUri: svgDataUri };
  }
);

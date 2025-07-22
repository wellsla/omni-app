
'use server';

/**
 * @fileOverview Creates a 3D object from a series of images.
 *
 * - create3dObjectFromImages - A function that handles the 3D object creation process.
 * - Create3dObjectFromImagesInput - The input type for the function.
 * - Create3dObjectFromImagesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const Create3dObjectFromImagesInputSchema = z.object({
  imageDataUris: z
    .array(z.string())
    .describe(
      "An array of images of an object from multiple angles, as data URIs. Each must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type Create3dObjectFromImagesInput = z.infer<typeof Create3dObjectFromImagesInputSchema>;

const Create3dObjectFromImagesOutputSchema = z.object({
  objectFileContent: z.string().describe('The content of the resulting 3D object file, formatted as a .obj file.'),
});
export type Create3dObjectFromImagesOutput = z.infer<typeof Create3dObjectFromImagesOutputSchema>;

export async function create3dObjectFromImages(input: Create3dObjectFromImagesInput): Promise<Create3dObjectFromImagesOutput> {
  return create3dObjectFromImagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'create3dObjectFromImagesPrompt',
  input: {schema: Create3dObjectFromImagesInputSchema},
  output: {schema: Create3dObjectFromImagesOutputSchema},
  prompt: `You are an expert in 3D modeling and photogrammetry. Analyze the following series of images, which show an object from different angles.
Your task is to generate a 3D model of the object based on these images.
The output should be a string containing the data for a standard Wavefront .obj file.
Generate vertices (v), vertex normals (vn), and faces (f). Infer the geometry, texture, and spatial relationships from the images provided. Do not include any text other than the obj file content.

{{#each imageDataUris}}
Image {{index}}: {{media url=this}}
{{/each}}`,
});

const create3dObjectFromImagesFlow = ai.defineFlow(
  {
    name: 'create3dObjectFromImagesFlow',
    inputSchema: Create3dObjectFromImagesInputSchema,
    outputSchema: Create3dObjectFromImagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('3D object generation failed to produce a result.');
    }
    return output;
  }
);

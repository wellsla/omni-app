'use server';

/**
 * @fileOverview Extracts text content from a PDF document.
 *
 * - extractTextFromPdf - A function that handles the text extraction process.
 * - ExtractTextFromPdfInput - The input type for the extractTextFromPdf function.
 * - ExtractTextFromPdfOutput - The return type for the extractTextFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document to extract text from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromPdfInput = z.infer<typeof ExtractTextFromPdfInputSchema>;


const ExtractTextFromPdfOutputSchema = z.object({
  extractedText: z
    .string()
    .describe('The extracted text content from the PDF document.'),
});
export type ExtractTextFromPdfOutput = z.infer<typeof ExtractTextFromPdfOutputSchema>;

export async function extractTextFromPdf(input: ExtractTextFromPdfInput): Promise<ExtractTextFromPdfOutput> {
  return extractTextFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTextFromPdfPrompt',
  input: {schema: ExtractTextFromPdfInputSchema},
  output: {schema: ExtractTextFromPdfOutputSchema},
  prompt: `You are an expert at document analysis. Extract all text from the provided PDF document. Return only the extracted text content, preserving original formatting and line breaks as much as possible.
\n\nDocument: {{media url=pdfDataUri}}`,
});

const extractTextFromPdfFlow = ai.defineFlow(
  {
    name: 'extractTextFromPdfFlow',
    inputSchema: ExtractTextFromPdfInputSchema,
    outputSchema: ExtractTextFromPdfOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

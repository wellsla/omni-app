'use server';

/**
 * @fileOverview Translates a document from one language to another.
 *
 * - translateDocument - A function that handles the document translation process.
 * - TranslateDocumentInput - The input type for the translateDocument function.
 * - TranslateDocumentOutput - The return type for the translateDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document to translate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  sourceLanguage: z.string().describe('The language of the document to translate.'),
  targetLanguage: z.string().describe('The language to translate the document to.'),
});
export type TranslateDocumentInput = z.infer<typeof TranslateDocumentInputSchema>;

const TranslateDocumentOutputSchema = z.object({
  translatedText: z
    .string()
    .describe('The translated text content of the document.'),
});
export type TranslateDocumentOutput = z.infer<typeof TranslateDocumentOutputSchema>;

export async function translateDocument(input: TranslateDocumentInput): Promise<TranslateDocumentOutput> {
  return translateDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateDocumentPrompt',
  input: {schema: TranslateDocumentInputSchema},
  output: {schema: TranslateDocumentOutputSchema},
  prompt: `You are a translation expert. Extract the text from the document and translate it from {{sourceLanguage}} to {{targetLanguage}}. Return only the translated text content.
\n\nDocument: {{media url=documentDataUri}}`,
});

const translateDocumentFlow = ai.defineFlow(
  {
    name: 'translateDocumentFlow',
    inputSchema: TranslateDocumentInputSchema,
    outputSchema: TranslateDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

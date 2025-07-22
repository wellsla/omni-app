'use server';

/**
 * @fileOverview Shortens a given URL using an external service.
 *
 * - shortenUrl - A function that handles the URL shortening process.
 * - ShortenUrlInput - The input type for the shortenUrl function.
 * - ShortenUrlOutput - The return type for the shortenUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShortenUrlInputSchema = z.object({
  url: z.string().url().describe('The long URL to be shortened.'),
});
export type ShortenUrlInput = z.infer<typeof ShortenUrlInputSchema>;

const ShortenUrlOutputSchema = z.object({
  shortUrl: z.string().url().describe('The shortened URL.'),
});
export type ShortenUrlOutput = z.infer<typeof ShortenUrlOutputSchema>;

export async function shortenUrl(input: ShortenUrlInput): Promise<ShortenUrlOutput> {
  return shortenUrlFlow(input);
}

const shortenUrlFlow = ai.defineFlow(
  {
    name: 'shortenUrlFlow',
    inputSchema: ShortenUrlInputSchema,
    outputSchema: ShortenUrlOutputSchema,
  },
  async (input) => {
    // We use an external API for this, as a real URL shortener requires a backend and database.
    // This flow acts as a server-side proxy to the external service.
    const TINT_URL_API = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(input.url)}`;
    
    try {
      const response = await fetch(TINT_URL_API);
      if (!response.ok) {
        throw new Error(`Failed to shorten URL. API responded with status: ${response.status}`);
      }
      const shortUrl = await response.text();
      // TinyURL can return 'Error' as text on failure
      if (shortUrl.toLowerCase().includes('error')) {
          throw new Error(`The URL shortening service returned an error: ${shortUrl}`);
      }
      return { shortUrl };
    } catch (error) {
      console.error("URL shortening error:", error);
      throw new Error(error instanceof Error ? error.message : "An unknown error occurred while shortening the URL.");
    }
  }
);

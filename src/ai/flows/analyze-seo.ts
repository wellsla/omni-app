'use server';

/**
 * @fileOverview An SEO analysis flow that fetches content from a URL and evaluates it.
 *
 * - analyzeSeo - A function that handles the SEO analysis process.
 * - AnalyzeSeoInput - The input type for the function.
 * - AnalyzeSeoOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// --- Tool Definition ---
// This tool fetches the raw HTML content from a given URL.
// The AI will decide to use this tool when it needs webpage content for analysis.
const fetchUrlContent = ai.defineTool(
  {
    name: 'fetchUrlContent',
    description: 'Fetches the HTML content of a given URL. Use this to get the necessary content for analysis.',
    inputSchema: z.object({url: z.string().url()}),
    outputSchema: z.object({
      status: z.enum(['success', 'error']),
      content: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  async ({url}) => {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const textContent = await response.text();
      return {status: 'success', content: textContent};
    } catch (e: any) {
      return {
        status: 'error',
        error: `Failed to fetch content from URL: ${e.message}`,
      };
    }
  }
);


// --- Input and Output Schemas ---
const AnalyzeSeoInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to analyze.'),
});
export type AnalyzeSeoInput = z.infer<typeof AnalyzeSeoInputSchema>;

const SeoCheckSchema = z.object({
  value: z.string().describe("The found value for the check (e.g., the actual title text)."),
  status: z.enum(['Good', 'Warning', 'Error']).describe("The status of this SEO check."),
  recommendation: z.string().describe("A brief, actionable recommendation for improvement if status is not 'Good'."),
});

const AnalyzeSeoOutputSchema = z.object({
  metaTitle: SeoCheckSchema.describe("Analysis of the page's meta title tag."),
  metaDescription: SeoCheckSchema.describe("Analysis of the page's meta description tag."),
  h1Count: SeoCheckSchema.describe("Analysis of the H1 heading tags. The value should be the count of H1s found."),
  imageAlts: SeoCheckSchema.describe("Analysis of image alt attributes. The value should summarize findings (e.g., '10/12 images have alt tags')."),
  keywordDensity: z.array(z.object({
    keyword: z.string(),
    count: z.number(),
    density: z.string().describe("Density as a percentage, e.g., '2.5%'"),
  })).describe("Top 3-5 most relevant keywords, their count, and density."),
  overallScore: z.number().min(0).max(100).describe("An overall SEO score from 0 to 100."),
  summary: z.string().describe("A concise, 2-3 sentence summary of the most critical SEO issues or strengths."),
});
export type AnalyzeSeoOutput = z.infer<typeof AnalyzeSeoOutputSchema>;


// --- Main Flow Function ---
export async function analyzeSeo(input: AnalyzeSeoInput): Promise<AnalyzeSeoOutput> {
  return analyzeSeoFlow(input);
}


// --- Genkit Prompt and Flow ---
const analyzeSeoPrompt = ai.definePrompt({
  name: 'analyzeSeoPrompt',
  input: {schema: z.object({url: z.string().url()})},
  output: {schema: AnalyzeSeoOutputSchema},
  tools: [fetchUrlContent],
  prompt: `You are an expert SEO analyzer. A user has provided a URL. Your goal is to analyze the on-page SEO of that URL.

  First, use the 'fetchUrlContent' tool to get the HTML of the provided URL: {{{url}}}.

  Once you have the HTML, perform a comprehensive SEO analysis based on the following criteria and return the data in the required JSON format:

  1.  **Meta Title**:
      - Find the content of the <title> tag.
      - **Status 'Good'**: Length is between 50-60 characters.
      - **Status 'Warning'**: Length is between 30-49 or 61-70 characters.
      - **Status 'Error'**: It's missing, empty, or outside the warning ranges.
      - **Recommendation**: Provide advice on optimizing the title length or creating one if it's missing.

  2.  **Meta Description**:
      - Find the content of the <meta name="description"> tag.
      - **Status 'Good'**: Length is between 120-158 characters.
      - **Status 'Warning'**: Length is between 80-119 or 159-170 characters.
      - **Status 'Error'**: It's missing, empty, or outside the warning ranges.
      - **Recommendation**: Advise on optimizing the description length or writing a compelling one.

  3.  **H1 Heading Count**:
      - Count the number of <h1> tags.
      - **Status 'Good'**: Exactly one <h1> tag exists.
      - **Status 'Error'**: There are 0 or more than one <h1> tags.
      - **Recommendation**: Explain the importance of having a single H1 tag for page structure.

  4.  **Image Alt Attributes**:
      - Analyze all <img> tags. Count how many have a non-empty 'alt' attribute vs. how many are missing it or have an empty one.
      - **Status 'Good'**: Over 90% of images have alt tags.
      - **Status 'Warning'**: Between 70% and 90% have alt tags.
      - **Status 'Error'**: Less than 70% have alt tags.
      - **Value**: Report as a string 'X/Y images have alt tags'.
      - **Recommendation**: Explain the importance of alt tags for accessibility and SEO.

  5. **Keyword Density**:
      - Analyze the visible text content (ignore HTML tags).
      - Identify the top 3-5 most frequent, relevant non-stopword keywords or keyphrases.
      - For each, calculate its density ( (count / total_words) * 100 ).
      - Return the keyword, its count, and its density formatted as a percentage string (e.g., "1.8%").

  6. **Overall Score & Summary**:
      - Based on all the checks above, calculate an overall score from 0 (very poor) to 100 (excellent).
      - Write a 2-3 sentence summary highlighting the most critical issues to fix or the page's main strengths.`,
});


const analyzeSeoFlow = ai.defineFlow(
  {
    name: 'analyzeSeoFlow',
    inputSchema: AnalyzeSeoInputSchema,
    outputSchema: AnalyzeSeoOutputSchema,
  },
  async (input) => {
    const {output} = await analyzeSeoPrompt(input);
    if (!output) {
        throw new Error("Analysis failed to produce a result.");
    }
    return output;
  }
);

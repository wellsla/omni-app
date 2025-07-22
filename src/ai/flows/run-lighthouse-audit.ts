
'use server';

/**
 * @fileOverview A Lighthouse audit simulation flow that analyzes a URL.
 *
 * - runLighthouseAudit - A function that handles the audit simulation.
 * - RunLighthouseAuditInput - The input type for the function.
 * - RunLighthouseAuditOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// --- Tool Definition ---
const fetchUrlContentForLighthouse = ai.defineTool(
  {
    name: 'fetchUrlContentForLighthouse',
    description: 'Fetches the HTML content of a given URL for analysis.',
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
const RunLighthouseAuditInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to audit.'),
});
export type RunLighthouseAuditInput = z.infer<typeof RunLighthouseAuditInputSchema>;


const AuditCategorySchema = z.object({
    score: z.number().min(0).max(100).describe("The score for this category, from 0 to 100."),
    recommendations: z.array(z.object({
        description: z.string().describe("A specific recommendation for improvement."),
        impact: z.enum(['High', 'Medium', 'Low']).describe("The potential impact of implementing this recommendation."),
    })).describe("A list of 2-4 key recommendations for this category."),
});

const RunLighthouseAuditOutputSchema = z.object({
  performance: AuditCategorySchema,
  accessibility: AuditCategorySchema,
  bestPractices: AuditCategorySchema,
  seo: AuditCategorySchema,
});
export type RunLighthouseAuditOutput = z.infer<typeof RunLighthouseAuditOutputSchema>;


// --- Main Flow Function ---
export async function runLighthouseAudit(input: RunLighthouseAuditInput): Promise<RunLighthouseAuditOutput> {
  return runLighthouseAuditFlow(input);
}


// --- Genkit Prompt and Flow ---
const runLighthouseAuditPrompt = ai.definePrompt({
  name: 'runLighthouseAuditPrompt',
  input: {schema: RunLighthouseAuditInputSchema},
  output: {schema: RunLighthouseAuditOutputSchema},
  tools: [fetchUrlContentForLighthouse],
  prompt: `You are an expert web performance and quality analyst, simulating Google's Lighthouse tool.
  A user has provided a URL. Your task is to perform a simulated audit based on its HTML content.

  First, use the 'fetchUrlContentForLighthouse' tool to get the HTML of the provided URL: {{{url}}}.

  After fetching the content, analyze it to generate a report with scores and recommendations for the four main Lighthouse categories: Performance, Accessibility, Best Practices, and SEO.

  For each category, provide a score from 0-100 and 2-4 actionable recommendations.

  **Analysis Guidelines:**

  1.  **Performance (Score & Recommendations):**
      - **Score:** Base this on factors like image optimization (presence of 'loading="lazy"', modern formats like 'webp'), asset minification (look for unminified CSS/JS), render-blocking resources in '<head>', and overall page size impression.
      - **Recommendations:** Suggest things like "Properly size images", "Minify CSS and JavaScript", "Eliminate render-blocking resources", or "Use next-gen image formats".

  2.  **Accessibility (Score & Recommendations):**
      - **Score:** Evaluate based on WCAG guidelines. Check for image 'alt' attributes, 'aria-*' attributes on interactive elements, '<label>'s for form inputs, document 'lang' attribute, and semantic HTML structure ('<main>', '<nav>', etc.).
      - **Recommendations:** Suggest "Add alt text to all images", "Ensure form elements have labels", "Use semantic HTML for better navigation", or "Improve color contrast".

  3.  **Best Practices (Score & Recommendations):**
      - **Score:** Check for modern web standards. Look for 'https://' usage, a valid doctype '<!DOCTYPE html>', no browser errors logged in the HTML (e.g., from 'onerror' attributes), and a secure 'rel="noopener noreferrer"' on external links.
      - **Recommendations:** Suggest "Use HTTPS for all resources", "Avoid deprecated APIs", "Set a proper doctype", or "Add 'rel='noopener noreferrer'' to external links".

  4.  **SEO (Score & Recommendations):**
      - **Score:** Analyze on-page SEO factors. Check for a '<title>' tag, a '<meta name="description">' tag, a single '<h1>', and descriptive anchor text for links. Check if the page seems mobile-friendly (has a viewport meta tag).
      - **Recommendations:** Suggest "Add a descriptive meta title", "Write a compelling meta description", "Ensure the page has a single H1 heading", or "Use descriptive anchor text for links".

  Return the final analysis in the specified JSON format.
  `,
});


const runLighthouseAuditFlow = ai.defineFlow(
  {
    name: 'runLighthouseAuditFlow',
    inputSchema: RunLighthouseAuditInputSchema,
    outputSchema: RunLighthouseAuditOutputSchema,
  },
  async (input) => {
    const {output} = await runLighthouseAuditPrompt(input);
    if (!output) {
        throw new Error("Lighthouse audit failed to produce a result.");
    }
    return output;
  }
);

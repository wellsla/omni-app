'use server';

/**
 * @fileOverview A browser compatibility checker that analyzes code against specified browsers.
 *
 * - checkBrowserCompatibility - A function that handles the compatibility analysis.
 * - CheckBrowserCompatibilityInput - The input type for the function.
 * - CheckBrowserCompatibilityOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckBrowserCompatibilityInputSchema = z.object({
  code: z.string().describe('The code snippet to be analyzed (e.g., CSS, JavaScript, HTML).'),
  language: z.string().describe('The programming language of the snippet (e.g., "CSS", "JavaScript").'),
  browsers: z.array(z.string()).describe('A list of target browsers to check compatibility against (e.g., ["Chrome", "Firefox", "Safari"]).'),
});
export type CheckBrowserCompatibilityInput = z.infer<typeof CheckBrowserCompatibilityInputSchema>;

const CompatibilityIssueSchema = z.object({
  feature: z.string().describe("The specific code feature or property that has a potential compatibility issue."),
  isSupported: z.boolean().describe("Overall support status across the selected browsers. True if supported by all, false otherwise."),
  unsupportedIn: z.array(z.string()).describe("A list of selected browsers where this feature is not fully supported."),
  recommendation: z.string().describe("Actionable advice, such as suggesting a vendor prefix, a fallback, or an alternative."),
});

const CheckBrowserCompatibilityOutputSchema = z.object({
  issues: z.array(CompatibilityIssueSchema).describe('An array of potential browser compatibility issues found in the code.'),
  summary: z.string().describe('A 1-2 sentence summary of the overall compatibility of the code snippet.'),
});
export type CheckBrowserCompatibilityOutput = z.infer<typeof CheckBrowserCompatibilityOutputSchema>;


export async function checkBrowserCompatibility(input: CheckBrowserCompatibilityInput): Promise<CheckBrowserCompatibilityOutput> {
  return checkBrowserCompatibilityFlow(input);
}


const prompt = ai.definePrompt({
  name: 'checkBrowserCompatibilityPrompt',
  input: {schema: CheckBrowserCompatibilityInputSchema},
  output: {schema: CheckBrowserCompatibilityOutputSchema},
  prompt: `You are an expert web developer and browser compatibility analyst. Your task is to analyze the provided code snippet and check its compatibility with the specified list of browsers.

Analyze the following {{language}} code:
\`\`\`{{language}}
{{code}}
\`\`\`

Check for compatibility issues across these browsers: {{#each browsers}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}.

For each potential issue you find:
1.  Identify the specific feature (e.g., CSS property 'display: grid', JavaScript API 'fetch').
2.  Determine if it's fully supported in all listed browsers.
3.  List the browsers where it might have issues (unsupported or partially supported).
4.  Provide a clear, actionable recommendation (e.g., "Add prefixes -webkit- and -moz-", "Use a polyfill for this API", "Consider using Flexbox as a fallback").

Return a JSON object with a list of issues and a brief overall summary. If there are no issues, return an empty 'issues' array and a positive summary.`,
});


const checkBrowserCompatibilityFlow = ai.defineFlow(
  {
    name: 'checkBrowserCompatibilityFlow',
    inputSchema: CheckBrowserCompatibilityInputSchema,
    outputSchema: CheckBrowserCompatibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Compatibility check failed to produce a result.");
    }
    return output;
  }
);

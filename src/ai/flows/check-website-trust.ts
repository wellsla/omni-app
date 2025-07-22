
'use server';

/**
 * @fileOverview A website trust analysis flow that evaluates a URL on multiple trust signals.
 *
 * - checkWebsiteTrust - A function that handles the website trust analysis process.
 * - CheckWebsiteTrustInput - The input type for the function.
 * - CheckWebsiteTrustOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// --- Tool Definitions ---

// This tool simulates checking SSL certificate details.
const checkSslCertificate = ai.defineTool(
  {
    name: 'checkSslCertificate',
    description: 'Checks the SSL certificate of a given domain. Provides issuer, validity, and subject.',
    inputSchema: z.object({domain: z.string()}),
    outputSchema: z.object({
      status: z.enum(['success', 'error']),
      issuedTo: z.string().optional(),
      issuer: z.string().optional(),
      validFrom: z.string().optional(),
      validTo: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  async ({domain}) => {
    try {
      // In a real scenario, this would involve a more complex check, possibly using a library.
      // For this demo, we'll simulate a successful fetch and generate plausible data.
      // This fetch is just to see if the domain is reachable over HTTPS.
      const response = await fetch(`https://${domain}`, {method: 'HEAD'});
      if (!response.ok) {
        throw new Error(`Website is not reachable over HTTPS or does not have a valid certificate.`);
      }
      
      const validFromDate = new Date();
      validFromDate.setFullYear(validFromDate.getFullYear() - 1);
      const validToDate = new Date();
      validToDate.setMonth(validToDate.getMonth() + 11);

      return {
        status: 'success',
        issuedTo: domain,
        issuer: "Let's Encrypt",
        validFrom: validFromDate.toISOString().split('T')[0],
        validTo: validToDate.toISOString().split('T')[0],
      };
    } catch (e: any) {
      return {
        status: 'error',
        error: `Failed to verify SSL certificate: ${e.message}`,
      };
    }
  }
);

// This tool simulates a WHOIS lookup for domain information.
const getDomainInfo = ai.defineTool(
    {
        name: 'getDomainInfo',
        description: 'Retrieves domain registration information, like creation date and registrar.',
        inputSchema: z.object({domain: z.string()}),
        outputSchema: z.object({
            status: z.enum(['success', 'error']),
            creationDate: z.string().optional(),
            registrar: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async ({domain}) => {
        try {
            // This is a simulation. A real WHOIS lookup would require a specialized service.
            // We'll generate a random-ish past date for the creation.
            const yearsOld = Math.floor(Math.random() * 10) + 1; // 1 to 10 years old
            const creationDate = new Date();
            creationDate.setFullYear(creationDate.getFullYear() - yearsOld);
            creationDate.setDate(creationDate.getDate() - Math.floor(Math.random() * 365));

            return {
                status: 'success',
                creationDate: creationDate.toISOString().split('T')[0],
                registrar: 'GoDaddy',
            };
        } catch (e: any) {
            return {
                status: 'error',
                error: `Failed to retrieve domain info: ${e.message}`,
            };
        }
    }
);


// --- Input and Output Schemas ---
const CheckWebsiteTrustInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to analyze.'),
});
export type CheckWebsiteTrustInput = z.infer<typeof CheckWebsiteTrustInputSchema>;

const TrustCheckSchema = z.object({
  value: z.string().describe("The found value for the check (e.g., the SSL issuer or domain age)."),
  status: z.enum(['Good', 'Warning', 'Error']).describe("The status of this trust check."),
  recommendation: z.string().describe("A brief explanation of what this check means for trustworthiness."),
});

const CheckWebsiteTrustOutputSchema = z.object({
  sslCertificate: TrustCheckSchema.describe("Analysis of the website's SSL certificate."),
  domainAge: TrustCheckSchema.describe("Analysis of the domain's age and registration."),
  contentSafety: TrustCheckSchema.describe("A simulated check for suspicious keywords or malware indicators in the page content."),
  popularity: TrustCheckSchema.describe("An estimated popularity and traffic ranking."),
  overallScore: z.number().min(0).max(100).describe("An overall trust score from 0 to 100."),
  summary: z.string().describe("A concise, 2-3 sentence summary of the website's trustworthiness."),
});
export type CheckWebsiteTrustOutput = z.infer<typeof CheckWebsiteTrustOutputSchema>;


// --- Main Flow Function ---
export async function checkWebsiteTrust(input: CheckWebsiteTrustInput): Promise<CheckWebsiteTrustOutput> {
  return checkWebsiteTrustFlow(input);
}


// --- Genkit Prompt and Flow ---
const checkWebsiteTrustPrompt = ai.definePrompt({
  name: 'checkWebsiteTrustPrompt',
  input: {schema: z.object({domain: z.string()})},
  output: {schema: CheckWebsiteTrustOutputSchema},
  tools: [checkSslCertificate, getDomainInfo],
  prompt: `You are a cybersecurity and website trust analyst. A user has provided a domain. Your goal is to analyze the trustworthiness of the website at that domain.

  First, use the provided tools to gather information about the domain: {{{domain}}}.
  - Use 'checkSslCertificate' to get SSL details.
  - Use 'getDomainInfo' to get domain registration details.

  Once you have the tool results, perform a comprehensive trust analysis and return the data in the required JSON format:

  1.  **SSL Certificate**:
      - **Value**: Name of the SSL issuer. If an error, state "Not Found".
      - **Status 'Good'**: A valid SSL certificate was found from a known issuer.
      - **Status 'Error'**: No SSL certificate or an error occurred.
      - **Recommendation**: Explain that HTTPS and a valid SSL are essential for secure communication.

  2.  **Domain Age**:
      - Based on the creation date from the tool, calculate the age in years.
      - **Value**: Report as "Approx. X years old".
      - **Status 'Good'**: Domain is older than 2 years.
      - **Status 'Warning'**: Domain is between 6 months and 2 years old.
      - **Status 'Error'**: Domain is less than 6 months old.
      - **Recommendation**: Explain that older domains are generally more trustworthy as they have a longer history.

  3.  **Content Safety**:
      - **This is a simulation.** Based on the domain name, make a judgment call.
      - **Value**: Report "Appears safe" or "Potentially suspicious".
      - **Status 'Good'**: If the site seems like a standard business, blog, etc. Report "Appears safe".
      - **Status 'Warning'**: If the domain name contains suspicious terms (e.g., 'free-money', 'crypto-lotto'), looks like a typo of a popular site, or is a long string of random characters. Report "Potentially suspicious".
      - **Recommendation**: Advise users to be cautious of sites with suspicious names or content.

  4.  **Popularity**:
      - **This is an estimation.** Based on the domain name, estimate its popularity.
      - **Value**: Provide a descriptive rank (e.g., "Top 1k", "Top 100k", "Likely Unranked").
      - **Status 'Good'**: If it's a well-known domain (google.com, wikipedia.org).
      - **Status 'Warning'**: If it seems like a niche but legitimate site.
      - **Status 'Error'**: If it seems obscure or unknown.
      - **Recommendation**: Explain that popular, well-known sites are less likely to be malicious.

  5.  **Overall Score & Summary**:
      - Based on all the checks above, calculate an overall trust score from 0 (very untrustworthy) to 100 (very trustworthy). Give significant weight to SSL and Domain Age.
      - Write a 2-3 sentence summary highlighting the most important trust signals, good or bad.`,
});


const checkWebsiteTrustFlow = ai.defineFlow(
  {
    name: 'checkWebsiteTrustFlow',
    inputSchema: CheckWebsiteTrustInputSchema,
    outputSchema: CheckWebsiteTrustOutputSchema,
  },
  async (input) => {
    // Extract domain from URL
    const domain = new URL(input.url).hostname;
    
    const {output} = await checkWebsiteTrustPrompt({ domain });
    if (!output) {
        throw new Error("Analysis failed to produce a result.");
    }
    return output;
  }
);

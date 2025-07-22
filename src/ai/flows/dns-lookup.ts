'use server';

/**
 * @fileOverview A DNS lookup flow that fetches DNS records for a given domain.
 *
 * - dnsLookup - A function that handles the DNS lookup process.
 * - DnsLookupInput - The input type for the function.
 * - DnsLookupOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DnsLookupInputSchema = z.object({
  domain: z.string().min(1, 'Domain name is required.'),
  recordType: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT']).describe('The type of DNS record to look up.'),
});
export type DnsLookupInput = z.infer<typeof DnsLookupInputSchema>;

const DnsRecordSchema = z.object({
    name: z.string().describe("The record name."),
    type: z.number().describe("The IANA record type number."),
    TTL: z.number().describe("The time-to-live for the record in seconds."),
    data: z.string().describe("The record's data, which varies by type (e.g., IP address for A records).")
});

const DnsLookupOutputSchema = z.object({
  records: z.array(DnsRecordSchema).describe('An array of DNS records found for the domain.'),
  error: z.string().optional().describe("An error message if the lookup failed."),
});
export type DnsLookupOutput = z.infer<typeof DnsLookupOutputSchema>;

const lookupDnsRecordsTool = ai.defineTool(
    {
        name: 'lookupDnsRecords',
        description: 'Performs a DNS lookup for a given domain and record type using a public DNS-over-HTTPS service.',
        inputSchema: DnsLookupInputSchema,
        outputSchema: DnsLookupOutputSchema,
    },
    async ({ domain, recordType }) => {
        const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(recordType)}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`DNS query failed with status: ${response.status}`);
            }
            const data = await response.json();
            
            // Status codes: 0 (NOERROR), 1 (FORMERR), 2 (SERVFAIL), 3 (NXDOMAIN), etc.
            if (data.Status !== 0) {
                return { records: [], error: `DNS query returned status ${data.Status}. Domain may not exist or has no such records.` };
            }

            return { records: data.Answer || [] };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred during DNS lookup.';
            return { records: [], error: message };
        }
    }
);


export async function dnsLookup(input: DnsLookupInput): Promise<DnsLookupOutput> {
  return dnsLookupFlow(input);
}


const dnsLookupFlow = ai.defineFlow(
  {
    name: 'dnsLookupFlow',
    inputSchema: DnsLookupInputSchema,
    outputSchema: DnsLookupOutputSchema,
  },
  async (input) => {
    // This flow simply acts as a wrapper around the tool.
    // In a more complex scenario, you could add more logic here,
    // like interpreting the results for the user.
    const result = await lookupDnsRecordsTool(input);
    return result;
  }
);

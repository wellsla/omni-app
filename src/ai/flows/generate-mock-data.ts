'use server';

/**
 * @fileOverview Mock data generation flow.
 *
 * - generateMockData - A function that generates mock data based on the specified type.
 * - GenerateMockDataInput - The input type for the generateMockData function.
 * - GenerateMockDataOutput - The return type for the generateMockData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMockDataInputSchema = z.object({
  dataType: z
    .string()
    .describe(
      'The type of mock data to generate (e.g., name, address, email, phone number).' 
    ),
  count: z.number().describe('The number of mock data entries to generate.'),
});
export type GenerateMockDataInput = z.infer<typeof GenerateMockDataInputSchema>;

const GenerateMockDataOutputSchema = z.object({
  mockData: z.array(z.string()).describe('An array of generated mock data.'),
});
export type GenerateMockDataOutput = z.infer<typeof GenerateMockDataOutputSchema>;

export async function generateMockData(input: GenerateMockDataInput): Promise<GenerateMockDataOutput> {
  return generateMockDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMockDataPrompt',
  input: {schema: GenerateMockDataInputSchema},
  output: {schema: GenerateMockDataOutputSchema},
  prompt: `You are a mock data generator. You will generate {{count}} entries of {{dataType}} data. Return it as a JSON array of strings.

Example:

Input: { dataType: \"name\", count: 2 }
Output: [\"John Doe\", \"Jane Smith\"]`,
});

const generateMockDataFlow = ai.defineFlow(
  {
    name: 'generateMockDataFlow',
    inputSchema: GenerateMockDataInputSchema,
    outputSchema: GenerateMockDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

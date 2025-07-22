
'use server';

/**
 * @fileOverview Generates structured mock data as SQL INSERT statements.
 *
 * - generateSqlInserts - A function that handles the SQL generation process.
 * - GenerateSqlInsertsInput - The input type for the generateSqlInserts function.
 * - GenerateSqlInsertsOutput - The return type for the generateSqlInserts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FieldSchema = z.object({
  name: z.string().describe('The name of the database column, e.g., "first_name".'),
  type: z.string().describe('The type of data to generate for the column, e.g., "first name".'),
});

const GenerateSqlInsertsInputSchema = z.object({
  fields: z.array(FieldSchema).describe('An array of objects representing the table columns.'),
  count: z.number().int().min(1).max(100).describe('The number of data rows to generate.'),
  tableName: z.string().describe('The name of the SQL table, e.g., "users".'),
  sqlDialect: z.enum(['postgresql', 'mysql', 'mssql']).describe('The SQL dialect for the INSERT statements.'),
});
export type GenerateSqlInsertsInput = z.infer<typeof GenerateSqlInsertsInputSchema>;

const GenerateSqlInsertsOutputSchema = z.object({
  sqlScript: z.string().describe('A single string containing all the generated SQL INSERT statements.'),
});
export type GenerateSqlInsertsOutput = z.infer<typeof GenerateSqlInsertsOutputSchema>;

export async function generateSqlInserts(input: GenerateSqlInsertsInput): Promise<GenerateSqlInsertsOutput> {
  return generateSqlInsertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSqlInsertsPrompt',
  input: {schema: GenerateSqlInsertsInputSchema},
  output: {schema: GenerateSqlInsertsOutputSchema},
  prompt: `You are an expert SQL mock data generator.
Your task is to generate {{count}} rows of mock data for a table named '{{tableName}}' and format them as SQL INSERT statements compatible with the '{{sqlDialect}}' dialect.

The table has the following columns and data types:
{{#each fields}}
- Column: '{{name}}', Data Type to Generate: '{{type}}'
{{/each}}

Generate a single SQL script containing all the INSERT statements.
- For PostgreSQL, MySQL, and Microsoft SQL Server (mssql), use the standard 'INSERT INTO "{{tableName}}" ("column1", "column2") VALUES ('value1', 'value2');' syntax.
- Ensure column names are always double-quoted to prevent issues with SQL keywords.
- Ensure all string values are enclosed in single quotes.
- Each INSERT statement must end with a semicolon.
- Do not include any explanations, comments, or other text outside of the SQL script. Just return the raw SQL.`,
});

const generateSqlInsertsFlow = ai.defineFlow(
  {
    name: 'generateSqlInsertsFlow',
    inputSchema: GenerateSqlInsertsInputSchema,
    outputSchema: GenerateSqlInsertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

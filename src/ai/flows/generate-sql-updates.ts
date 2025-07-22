
'use server';

/**
 * @fileOverview Generates structured mock data as SQL UPDATE statements.
 *
 * - generateSqlUpdates - A function that handles the SQL generation process.
 * - GenerateSqlUpdatesInput - The input type for the generateSqlUpdates function.
 * - GenerateSqlUpdatesOutput - The return type for the generateSqlUpdates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FieldSchema = z.object({
  name: z.string().describe('The name of the database column, e.g., "first_name".'),
  type: z.string().describe('The type of data to generate for the column, e.g., "first name".'),
});

const GenerateSqlUpdatesInputSchema = z.object({
  fields: z.array(FieldSchema).describe('An array of objects representing the table columns to update.'),
  count: z.number().int().min(1).max(100).describe('The number of UPDATE statements to generate.'),
  tableName: z.string().describe('The name of the SQL table, e.g., "users".'),
  sqlDialect: z.enum(['postgresql', 'mysql', 'mssql']).describe('The SQL dialect for the UPDATE statements.'),
  whereClause: z.string().describe('The WHERE clause template. Use placeholders like {{uuid}} or {{row_index}} which will be replaced for each statement.'),
});
export type GenerateSqlUpdatesInput = z.infer<typeof GenerateSqlUpdatesInputSchema>;

const GenerateSqlUpdatesOutputSchema = z.object({
  sqlScript: z.string().describe('A single string containing all the generated SQL UPDATE statements.'),
});
export type GenerateSqlUpdatesOutput = z.infer<typeof GenerateSqlUpdatesOutputSchema>;

export async function generateSqlUpdates(input: GenerateSqlUpdatesInput): Promise<GenerateSqlUpdatesOutput> {
  return generateSqlUpdatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSqlUpdatesPrompt',
  input: {schema: GenerateSqlUpdatesInputSchema},
  output: {schema: GenerateSqlUpdatesOutputSchema},
  prompt: `You are an expert SQL mock data generator.
Your task is to generate {{count}} SQL UPDATE statements for a table named '{{tableName}}' using the '{{sqlDialect}}' dialect.

For each statement, you will update the following columns with new mock data:
{{#each fields}}
- Column: '{{name}}', Data Type to Generate: '{{type}}'
{{/each}}

The WHERE clause for each statement should follow this template: '{{whereClause}}'.
You must replace any placeholders like '{{uuid}}' or '{{row_index}}' in the WHERE clause with a unique value for each generated statement. For '{{row_index}}', use a 1-based index.

- Generate a single SQL script containing all the UPDATE statements.
- For PostgreSQL, MySQL, and Microsoft SQL Server (mssql), use the standard 'UPDATE "{{tableName}}" SET "column1" = 'value1', "column2" = 'value2' WHERE ...;' syntax.
- Ensure column names are always double-quoted to prevent issues with SQL keywords.
- Ensure all string values are enclosed in single quotes.
- Each UPDATE statement must end with a semicolon.
- Do not include any explanations, comments, or other text outside of the SQL script. Just return the raw SQL.`,
});

const generateSqlUpdatesFlow = ai.defineFlow(
  {
    name: 'generateSqlUpdatesFlow',
    inputSchema: GenerateSqlUpdatesInputSchema,
    outputSchema: GenerateSqlUpdatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

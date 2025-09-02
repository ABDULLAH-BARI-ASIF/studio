'use server';
/**
 * @fileOverview Explains the grammar rule of a fill-in-the-gaps question in Bangla.
 *
 * - explainGrammarRuleInBangla - A function that explains the grammar rule in Bangla.
 * - ExplainGrammarRuleInBanglaInput - The input type for the explainGrammarRuleInBangla function.
 * - ExplainGrammarRuleInBanglaOutput - The return type for the explainGrammarRuleInBangla function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainGrammarRuleInBanglaInputSchema = z.object({
  sentence: z.string().describe('The fill-in-the-gaps sentence to analyze.'),
});
export type ExplainGrammarRuleInBanglaInput = z.infer<typeof ExplainGrammarRuleInBanglaInputSchema>;

const ExplainGrammarRuleInBanglaOutputSchema = z.object({
  explanation: z.string().describe('The grammar rule explanation in Bangla in markdown format.'),
});
export type ExplainGrammarRuleInBanglaOutput = z.infer<typeof ExplainGrammarRuleInBanglaOutputSchema>;

export async function explainGrammarRuleInBangla(input: ExplainGrammarRuleInBanglaInput): Promise<ExplainGrammarRuleInBanglaOutput> {
  return explainGrammarRuleInBanglaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainGrammarRuleInBanglaPrompt',
  input: {schema: ExplainGrammarRuleInBanglaInputSchema},
  output: {schema: ExplainGrammarRuleInBanglaOutputSchema},
  prompt: `You are an expert Bangla grammar tutor.

  Explain the grammar rule used in the following fill-in-the-gaps sentence in Bangla using markdown format, so the user can understand the grammatical principle behind the correct answer.

  Sentence: {{{sentence}}}`,
});

const explainGrammarRuleInBanglaFlow = ai.defineFlow(
  {
    name: 'explainGrammarRuleInBanglaFlow',
    inputSchema: ExplainGrammarRuleInBanglaInputSchema,
    outputSchema: ExplainGrammarRuleInBanglaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

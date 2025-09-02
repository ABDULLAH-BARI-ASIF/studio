'use server';
/**
 * @fileOverview Generates an extensive explanation for a fill-in-the-gaps question.
 *
 * - generateExtensiveExplanation - A function that generates the explanation.
 */

import {ai} from '@/ai/genkit';
import {
  ExtensiveExplanationInputSchema,
  ExtensiveExplanationOutputSchema,
  type ExtensiveExplanationInput,
  type ExtensiveExplanationOutput,
} from '@/ai/schemas/extensive-explanation-schemas';

export {type ExtensiveExplanationInput, type ExtensiveExplanationOutput};

export async function generateExtensiveExplanation(input: ExtensiveExplanationInput): Promise<ExtensiveExplanationOutput> {
  return extensiveExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extensiveExplanationPrompt',
  input: {schema: ExtensiveExplanationInputSchema},
  output: {schema: ExtensiveExplanationOutputSchema},
  prompt: `You are an expert English grammar tutor. You will be given a sentence with a blank, the options provided, and the correct answer.

Your task is to provide a detailed explanation in Bangla. The explanation should cover:
1.  Why the correct answer is the right fit for the sentence, explaining the relevant grammar rule in detail.
2.  Why each of the other provided options is incorrect, explaining the grammatical error for each case.

Question: {{{question}}}
Options: {{#each options}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Correct Answer: {{{correctAnswer}}}
`,
});

const extensiveExplanationFlow = ai.defineFlow(
  {
    name: 'extensiveExplanationFlow',
    inputSchema: ExtensiveExplanationInputSchema,
    outputSchema: ExtensiveExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

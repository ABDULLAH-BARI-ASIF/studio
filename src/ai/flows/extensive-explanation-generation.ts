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
  prompt: `You are an expert English grammar tutor. You will be given a sentence with a blank, the options provided, and the correct answer. Your response should use markdown for formatting, but you must not use '#' for headings or '*' for bold/italics.

Your task is to provide an advanced, detailed explanation in Bangla about why the correct answer is the right fit, explaining the relevant grammar rule in detail. 

Also, include some clear examples to illustrate the grammar rule. Always wrap the examples between two markdown horizontal rules like this:
---
Example 1...
Example 2...
---

Do not explain why the other options are incorrect.

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

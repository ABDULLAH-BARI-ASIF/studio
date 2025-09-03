'use server';

/**
 * @fileOverview Fills in the gaps in a sentence using the Gemini API, with optional multiple-choice answers.
 *
 * - fillInTheGaps - A function that fills in the gaps in a sentence.
 */

import {ai} from '@/ai/genkit';
import {
  FillInTheGapsInputSchema,
  FillInTheGapsOutputSchema,
  type FillInTheGapsInput,
  type FillInTheGapsOutput,
} from '@/ai/schemas/fill-in-the-gaps-schemas';

export {type FillInTheGapsInput, type FillInTheGapsOutput};

const prompt = ai.definePrompt({
  name: 'fillInTheGapsPrompt',
  input: {schema: FillInTheGapsInputSchema},
  output: {schema: FillInTheGapsOutputSchema},
  prompt: `You are an expert English grammar tutor.

You will be given a sentence with a blank indicated by an underscore "_" or a hyphen "-". You may also be given a list of options.

Your task is to:
1.  Determine the correct word or phrase to fill in the blank. If options are provided, choose the correct one.
2.  Provide a brief explanation in Bangla of the grammar rule that applies to the sentence.
3.  Return the original question in your response.

Question: {{{question}}}

{{#if options}}
Options:
{{#each options}}
- {{{this}}}
{{/each}}
{{/if}}
`,
});

export const fillInTheGaps = ai.defineFlow(
  {
    name: 'fillInTheGapsFlow',
    inputSchema: FillInTheGapsInputSchema,
    outputSchema: FillInTheGapsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to get output from LLM');
    }
    return {...output, question: input.question};
  }
);

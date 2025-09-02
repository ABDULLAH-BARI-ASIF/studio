'use server';

/**
 * @fileOverview Fills in the gaps in a sentence using the Gemini API, with optional multiple-choice answers.
 *
 * - fillInTheGaps - A function that fills in the gaps in a sentence.
 * - FillInTheGapsInput - The input type for the fillInTheGaps function.
 * - FillInTheGapsOutput - The return type for the fillInTheGaps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FillInTheGapsInputSchema = z.object({
  question: z.string().describe('The sentence with a blank to fill in, marked by "_" or "-".'),
  options: z.array(z.string()).optional().describe('An optional array of choices for the blank.'),
});
export type FillInTheGapsInput = z.infer<typeof FillInTheGapsInputSchema>;

const FillInTheGapsOutputSchema = z.object({
  correctAnswer: z.string().describe('The correct word or phrase for the blank.'),
  explanation: z.string().describe('A brief explanation in Bangla about the grammar rule used.'),
});
export type FillInTheGapsOutput = z.infer<typeof FillInTheGapsOutputSchema>;

export async function fillInTheGaps(input: FillInTheGapsInput): Promise<FillInTheGapsOutput> {
  return fillInTheGapsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fillInTheGapsPrompt',
  input: {schema: FillInTheGapsInputSchema},
  output: {schema: FillInTheGapsOutputSchema},
  prompt: `You are an expert English grammar tutor.

You will be given a sentence with a blank indicated by an underscore "_" or a hyphen "-". You may also be given a list of options.

Your task is to:
1. Determine the correct word or phrase to fill in the blank. If options are provided, choose the correct one.
2. Provide a brief explanation in Bangla of the grammar rule that applies to the sentence.

Question: {{{question}}}

{{#if options}}
Options:
{{#each options}}
- {{{this}}}
{{/each}}
{{/if}}
`,
});

const fillInTheGapsFlow = ai.defineFlow(
  {
    name: 'fillInTheGapsFlow',
    inputSchema: FillInTheGapsInputSchema,
    outputSchema: FillInTheGapsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

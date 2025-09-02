'use server';

/**
 * @fileOverview Fills in the gaps in a sentence using the Gemini API.
 *
 * - fillInTheGaps - A function that fills in the gaps in a sentence.
 * - FillInTheGapsInput - The input type for the fillInTheGaps function.
 * - FillInTheGapsOutput - The return type for the fillInTheGaps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FillInTheGapsInputSchema = z.object({
  sentence: z.string().describe('The sentence with a blank to fill in.'),
});
export type FillInTheGapsInput = z.infer<typeof FillInTheGapsInputSchema>;

const FillInTheGapsOutputSchema = z.object({
  completedSentence: z.string().describe('The sentence with the blank filled in.'),
  grammarRuleExplanation: z.string().describe('The grammar rule in Bangla.'),
  partOfSpeechDiagram: z.string().describe('A diagram analyzing each part of speech.'),
});
export type FillInTheGapsOutput = z.infer<typeof FillInTheGapsOutputSchema>;

export async function fillInTheGaps(input: FillInTheGapsInput): Promise<FillInTheGapsOutput> {
  return fillInTheGapsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fillInTheGapsPrompt',
  input: {schema: FillInTheGapsInputSchema},
  output: {schema: FillInTheGapsOutputSchema},
  prompt: `You are an expert in filling in the blanks in sentences.

You will be given a sentence with a blank indicated by an underscore "_" or a hyphen "-".

Your task is to:
1. Fill in the blank with the correct answer.
2. Explain the grammar rule used in the sentence in Bangla.
3. Generate a detailed diagram analyzing each part of speech in the sentence, identifying elements such as modal verbs and proper nouns. Use Markdown formatting.

Sentence: {{{sentence}}}

Format your output as follows, and make sure to use Markdown formatting:

**Completed Sentence:** [Completed sentence with the blank filled in]

**Grammar Rule (Bangla):** [Explanation of the grammar rule in Bangla]

**Part of Speech Diagram:**
[Detailed part of speech diagram analyzing each word]
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

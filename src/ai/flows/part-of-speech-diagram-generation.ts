'use server';
/**
 * @fileOverview Generates a part-of-speech diagram for a given sentence.
 *
 * - generatePartOfSpeechDiagram - A function that generates the part-of-speech diagram.
 * - PartOfSpeechDiagramInput - The input type for the generatePartOfSpeechDiagram function.
 * - PartOfSpeechDiagramOutput - The return type for the generatePartOfSpeechDiagram function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PartOfSpeechDiagramInputSchema = z.object({
  sentence: z.string().describe('The sentence to analyze.'),
});
export type PartOfSpeechDiagramInput = z.infer<typeof PartOfSpeechDiagramInputSchema>;

const PartOfSpeechDiagramOutputSchema = z.object({
  diagram: z.string().describe('A textual diagram representing the part-of-speech analysis of the sentence. Use markdown formatting.'),
});
export type PartOfSpeechDiagramOutput = z.infer<typeof PartOfSpeechDiagramOutputSchema>;

export async function generatePartOfSpeechDiagram(input: PartOfSpeechDiagramInput): Promise<PartOfSpeechDiagramOutput> {
  return partOfSpeechDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'partOfSpeechDiagramPrompt',
  input: {schema: PartOfSpeechDiagramInputSchema},
  output: {schema: PartOfSpeechDiagramOutputSchema},
  prompt: `You are an expert linguist. Generate a part-of-speech diagram for the following sentence. Use markdown formatting to create the diagram, clearly indicating each word's part of speech, and identifying elements such as modal verbs and proper nouns. Return only the diagram. Do not provide any intro or conclusion. Just return the diagram in markdown format.\n\nSentence: {{{sentence}}}`, 
});

const partOfSpeechDiagramFlow = ai.defineFlow(
  {
    name: 'partOfSpeechDiagramFlow',
    inputSchema: PartOfSpeechDiagramInputSchema,
    outputSchema: PartOfSpeechDiagramOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

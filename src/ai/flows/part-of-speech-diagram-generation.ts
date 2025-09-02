'use server';
/**
 * @fileOverview Generates a part-of-speech diagram for a given sentence.
 *
 * - generatePartOfSpeechDiagram - A function that generates the part-of-speech diagram.
 */

import {ai} from '@/ai/genkit';
import {
  PartOfSpeechDiagramInputSchema,
  PartOfSpeechDiagramOutputSchema,
  type PartOfSpeechDiagramInput,
  type PartOfSpeechDiagramOutput,
} from '@/ai/schemas/part-of-speech-diagram-schemas';

export {type PartOfSpeechDiagramInput, type PartOfSpeechDiagramOutput};

export async function generatePartOfSpeechDiagram(input: PartOfSpeechDiagramInput): Promise<PartOfSpeechDiagramOutput> {
  return partOfSpeechDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'partOfSpeechDiagramPrompt',
  input: {schema: PartOfSpeechDiagramInputSchema},
  output: {schema: PartOfSpeechDiagramOutputSchema},
  prompt: `You are an expert linguist. Generate a detailed part-of-speech analysis for the following sentence. 
  
Your analysis must be thorough. Identify not just basic parts of speech, but also more specific categories like:
- Proper nouns
- Tenses (e.g., present continuous, past perfect)
- Modal verbs
- Articles
- Conjunctions (coordinating, subordinating)
- Prepositions
- Interjections

Return the analysis as a JSON object that adheres to the output schema.

Sentence: {{{sentence}}}`,
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

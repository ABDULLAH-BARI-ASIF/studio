import {z} from 'genkit';

export const PartOfSpeechDiagramInputSchema = z.object({
  sentence: z.string().describe('The sentence to analyze.'),
});
export type PartOfSpeechDiagramInput = z.infer<typeof PartOfSpeechDiagramInputSchema>;

export const PartOfSpeechDiagramOutputSchema = z.object({
  analysis: z.array(z.object({
    word: z.string().describe('The word from the sentence.'),
    partOfSpeech: z.string().describe('The detailed part of speech for the word.'),
  })).describe('An array of objects, each containing a word and its part of speech.'),
});
export type PartOfSpeechDiagramOutput = z.infer<typeof PartOfSpeechDiagramOutputSchema>;

import {z} from 'genkit';

export const PartOfSpeechDiagramInputSchema = z.object({
  sentence: z.string().describe('The sentence to analyze.'),
});
export type PartOfSpeechDiagramInput = z.infer<typeof PartOfSpeechDiagramInputSchema>;

export const PartOfSpeechDiagramOutputSchema = z.object({
  diagram: z.string().describe('A textual diagram representing the part-of-speech analysis of the sentence. Use markdown formatting.'),
});
export type PartOfSpeechDiagramOutput = z.infer<typeof PartOfSpeechDiagramOutputSchema>;

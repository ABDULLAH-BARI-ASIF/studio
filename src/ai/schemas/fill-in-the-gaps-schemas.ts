import {z} from 'genkit';

export const FillInTheGapsInputSchema = z.object({
  question: z.string().describe('The sentence with a blank to fill in, marked by "_" or "-".'),
  options: z.array(z.string()).optional().describe('An optional array of choices for the blank.'),
});
export type FillInTheGapsInput = z.infer<typeof FillInTheGapsInputSchema>;

export const FillInTheGapsOutputSchema = z.object({
  question: z.string().describe('The original question with the blank.'),
  correctAnswer: z.string().describe('The correct word or phrase for the blank.'),
  explanation: z.string().describe('A brief explanation in Bangla about the grammar rule used.'),
});
export type FillInTheGapsOutput = z.infer<typeof FillInTheGapsOutputSchema>;

import {z} from 'genkit';

export const ExtensiveExplanationInputSchema = z.object({
  question: z.string().describe('The sentence with a blank to fill in, marked by "_" or "-".'),
  options: z.array(z.string()).describe('The array of choices provided to the user.'),
  correctAnswer: z.string().describe('The correct answer that was chosen.'),
});
export type ExtensiveExplanationInput = z.infer<typeof ExtensiveExplanationInputSchema>;

export const ExtensiveExplanationOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation in Bangla about why the correct answer is right and the other options are wrong.'),
});
export type ExtensiveExplanationOutput = z.infer<typeof ExtensiveExplanationOutputSchema>;

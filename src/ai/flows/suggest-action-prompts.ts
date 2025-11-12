'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting prompts to classify remote actions.
 *
 * The flow uses an LLM to generate a list of suggested prompts that can be used to classify remote control actions for various applications.
 * It exports:
 *   - `suggestActionPrompts`: An async function that triggers the prompt suggestion flow.
 *   - `SuggestActionPromptsInput`: The input type for the `suggestActionPrompts` function (currently empty).
 *   - `SuggestActionPromptsOutput`: The output type for the `suggestActionPrompts` function, which is an array of strings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestActionPromptsInputSchema = z.object({});
export type SuggestActionPromptsInput = z.infer<typeof SuggestActionPromptsInputSchema>;

const SuggestActionPromptsOutputSchema = z.array(z.string());
export type SuggestActionPromptsOutput = z.infer<typeof SuggestActionPromptsOutputSchema>;

export async function suggestActionPrompts(input: SuggestActionPromptsInput): Promise<SuggestActionPromptsOutput> {
  return suggestActionPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestActionPromptsPrompt',
  input: {schema: SuggestActionPromptsInputSchema},
  output: {schema: SuggestActionPromptsOutputSchema},
  prompt: `You are an expert in designing prompts for classifying remote control actions.

  Generate a list of diverse prompts that can be used to classify remote actions for various applications such as media control, browsing, document processing, etc. Each prompt should be clear and concise, suitable for an LLM to understand and classify different remote actions.

  The prompts should be in simple and common language, each describing an application domain and an associated action for that domain, phrased as instructions to classify.

  The prompts should only suggest a single action and domain and should be very short.

  Return the prompts as a JSON array of strings.

  Example:
  [
    "Classify media control actions",
    "Classify browsing actions",
    "Classify document processing actions",
    "Identify music player remote control actions",
  ]
  `,
});

const suggestActionPromptsFlow = ai.defineFlow(
  {
    name: 'suggestActionPromptsFlow',
    inputSchema: SuggestActionPromptsInputSchema,
    outputSchema: SuggestActionPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

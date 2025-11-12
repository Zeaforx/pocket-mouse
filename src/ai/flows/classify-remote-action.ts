'use server';

/**
 * @fileOverview Classifies remote control actions based on gesture data.
 *
 * - classifyRemoteAction - A function that classifies remote actions.
 * - ClassifyRemoteActionInput - The input type for the classifyRemoteAction function.
 * - ClassifyRemoteActionOutput - The return type for the classifyRemoteAction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyRemoteActionInputSchema = z.object({
  gestureData: z
    .string()
    .describe(
      'A string representing the gesture data from the touchpad or keyboard inputs.'
    ),
  context: z
    .string()
    .optional()
    .describe(
      'Optional context about the application being controlled (e.g., media player, browser, document editor).'+
      'If provided, it will make for better action classification accuracy.'
    ),
});
export type ClassifyRemoteActionInput = z.infer<typeof ClassifyRemoteActionInputSchema>;

const ClassifyRemoteActionOutputSchema = z.object({
  action: z
    .string()
    .describe(
      'The classified remote control action (e.g., play/pause, volume up/down, scroll).'+
      'Must be one of these actions: play/pause, volume up, volume down, scroll up, scroll down, next, previous, stop, beginning, end.'
    ),
  confidence: z
    .number()
    .describe('A number between 0 and 1 indicating the confidence level of the classification.'),
});
export type ClassifyRemoteActionOutput = z.infer<typeof ClassifyRemoteActionOutputSchema>;

export async function classifyRemoteAction(
  input: ClassifyRemoteActionInput
): Promise<ClassifyRemoteActionOutput> {
  return classifyRemoteActionFlow(input);
}

const classifyRemoteActionPrompt = ai.definePrompt({
  name: 'classifyRemoteActionPrompt',
  input: {schema: ClassifyRemoteActionInputSchema},
  output: {schema: ClassifyRemoteActionOutputSchema},
  prompt: `You are a remote control action classifier. You take gesture data as input, and output the remote control action being performed.

Valid actions are:
- play/pause
- volume up
- volume down
- scroll up
- scroll down
- next
- previous
- stop
- beginning
- end

Gesture Data: {{{gestureData}}}
Context: {{{context}}}

Given the gesture data and context, the action is: `,
});

const classifyRemoteActionFlow = ai.defineFlow(
  {
    name: 'classifyRemoteActionFlow',
    inputSchema: ClassifyRemoteActionInputSchema,
    outputSchema: ClassifyRemoteActionOutputSchema,
  },
  async input => {
    const {output} = await classifyRemoteActionPrompt(input);
    return output!;
  }
);

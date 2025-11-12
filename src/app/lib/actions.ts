'use server';

import { classifyRemoteAction, ClassifyRemoteActionOutput } from '@/ai/flows/classify-remote-action';
import { suggestActionPrompts } from '@/ai/flows/suggest-action-prompts';

export async function handleClassifyGesture(
  gestureData: string,
  context: string
): Promise<{ success: true; data: ClassifyRemoteActionOutput } | { success: false; error: string }> {
  if (!gestureData || gestureData.length < 2) {
    return { success: false, error: 'Not enough gesture data to classify.' };
  }
  try {
    const result = await classifyRemoteAction({ gestureData, context });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error classifying gesture:', error);
    return { success: false, error: 'Failed to classify action.' };
  }
}

export async function handleSuggestPrompts(): Promise<{ success: true; data: string[] } | { success: false; error: string }> {
  try {
    const result = await suggestActionPrompts({});
    return { success: true, data: result };
  } catch (error) {
    console.error('Error suggesting prompts:', error);
    return { success: false, error: 'Failed to suggest prompts.' };
  }
}

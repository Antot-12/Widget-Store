// This is a server-side file!
'use server';

/**
 * @fileOverview A widget recommendation AI agent.
 *
 * - getWidgetRecommendations - A function that handles the widget recommendation process.
 * - WidgetRecommendationsInput - The input type for the getWidgetRecommendations function.
 * - WidgetRecommendationsOutput - The return type for the getWidgetRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ALL_WIDGETS } from '@/app/data';


const WidgetRecommendationsInputSchema = z.object({
  searchQuery: z.string().describe('The user search query.'),
  userHistory: z.string().optional().describe('The user browsing history as a string.'),
  allWidgets: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
  })).describe('A list of all available widgets in the store.')
});
export type WidgetRecommendationsInput = z.infer<typeof WidgetRecommendationsInputSchema>;

const WidgetRecommendationsOutputSchema = z.object({
  widgetRecommendations: z.array(
    z.object({
      name: z.string().describe('The name of the recommended widget.'),
      description: z.string().describe('A short description of the widget.'),
    })
  ).describe('An array of recommended widgets based on the search query and user history.'),
});
export type WidgetRecommendationsOutput = z.infer<typeof WidgetRecommendationsOutputSchema>;

export async function getWidgetRecommendations(input: Omit<WidgetRecommendationsInput, 'allWidgets'>): Promise<WidgetRecommendationsOutput> {
  const allWidgetsForPrompt = ALL_WIDGETS.map(({ id, name, description, category, tags }) => ({ id, name, description, category, tags }));
  return widgetRecommendationsFlow({...input, allWidgets: allWidgetsForPrompt });
}

const prompt = ai.definePrompt({
  name: 'widgetRecommendationsPrompt',
  input: {schema: WidgetRecommendationsInputSchema},
  output: {schema: WidgetRecommendationsOutputSchema},
  prompt: `You are a widget recommendation expert for an online widget store. Your task is to recommend relevant widgets to users based on their search query and browsing history.

You have been provided with a complete list of all available widgets in the store. Use this list as your primary source of information.

**Available Widgets (JSON):**
\`\`\`json
{{{json allWidgets}}}
\`\`\`

**User Information:**
- Search Query: \`{{{searchQuery}}}\`
- User History: \`{{{userHistory}}}\`

**Your Goal:**
Based on the user's search query and browsing history, select and recommend the most relevant widgets from the provided list. Return your recommendations in the requested JSON format.

**Important Instructions:**
- Only recommend widgets that exist in the "Available Widgets" list.
- If the search query is vague, use the user's history to infer their intent.
- Provide a concise and accurate description for each recommended widget based on the information in the list.
`, 
});

const widgetRecommendationsFlow = ai.defineFlow(
  {
    name: 'widgetRecommendationsFlow',
    inputSchema: WidgetRecommendationsInputSchema,
    outputSchema: WidgetRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

// Auto-learning system for Rubi
// Extracts and stores key information from conversations

import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
});

interface LearnedInfo {
  topics: string[];
  preferences: string[];
  facts: string[];
  interests: string[];
}

export async function extractLearnings(
  userMessage: string,
  assistantResponse: string,
  existingContext: string | null
): Promise<LearnedInfo | null> {
  try {
    const prompt = `Analyze this conversation exchange and extract any new information worth remembering about the user for future conversations.

USER MESSAGE: "${userMessage}"

ASSISTANT RESPONSE: "${assistantResponse}"

EXISTING CONTEXT ABOUT USER: ${existingContext || "None yet"}

Extract ONLY new, specific, and useful information. Return a JSON object with:
- topics: Array of topics the user is interested in or discussed
- preferences: Array of preferences the user mentioned (communication style, likes/dislikes)
- facts: Array of facts about the user (job, location, expertise, etc.)
- interests: Array of hobbies, interests, or passions mentioned

Rules:
- Only include NEW information not already in existing context
- Be specific and concise
- If no new information is found, return empty arrays
- Maximum 3 items per category
- Each item should be a short phrase (max 10 words)

Return ONLY valid JSON, no other text.`;

    const response = await openrouter.chat.completions.create({
      model: "mistralai/mistral-medium-3",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return null;

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as LearnedInfo;
    
    // Filter out empty or invalid entries
    return {
      topics: (parsed.topics || []).filter(t => t && t.length > 0).slice(0, 3),
      preferences: (parsed.preferences || []).filter(p => p && p.length > 0).slice(0, 3),
      facts: (parsed.facts || []).filter(f => f && f.length > 0).slice(0, 3),
      interests: (parsed.interests || []).filter(i => i && i.length > 0).slice(0, 3),
    };
  } catch (error) {
    console.error("Error extracting learnings:", error);
    return null;
  }
}

export function mergeContexts(
  existingContext: string | null,
  newLearnings: LearnedInfo
): string {
  const sections: string[] = [];
  
  // Parse existing context if available
  let existingTopics: string[] = [];
  let existingPreferences: string[] = [];
  let existingFacts: string[] = [];
  let existingInterests: string[] = [];
  
  if (existingContext) {
    const topicsMatch = existingContext.match(/Topics: (.+?)(?:\n|$)/);
    const prefsMatch = existingContext.match(/Preferences: (.+?)(?:\n|$)/);
    const factsMatch = existingContext.match(/Facts: (.+?)(?:\n|$)/);
    const interestsMatch = existingContext.match(/Interests: (.+?)(?:\n|$)/);
    
    if (topicsMatch) existingTopics = topicsMatch[1].split(", ");
    if (prefsMatch) existingPreferences = prefsMatch[1].split(", ");
    if (factsMatch) existingFacts = factsMatch[1].split(", ");
    if (interestsMatch) existingInterests = interestsMatch[1].split(", ");
  }
  
  // Merge and deduplicate (keeping max 10 per category)
  const mergedTopics = Array.from(new Set([...existingTopics, ...newLearnings.topics])).slice(0, 10);
  const mergedPrefs = Array.from(new Set([...existingPreferences, ...newLearnings.preferences])).slice(0, 10);
  const mergedFacts = Array.from(new Set([...existingFacts, ...newLearnings.facts])).slice(0, 10);
  const mergedInterests = Array.from(new Set([...existingInterests, ...newLearnings.interests])).slice(0, 10);
  
  if (mergedTopics.length > 0) sections.push(`Topics: ${mergedTopics.join(", ")}`);
  if (mergedPrefs.length > 0) sections.push(`Preferences: ${mergedPrefs.join(", ")}`);
  if (mergedFacts.length > 0) sections.push(`Facts: ${mergedFacts.join(", ")}`);
  if (mergedInterests.length > 0) sections.push(`Interests: ${mergedInterests.join(", ")}`);
  
  return sections.join("\n") || "";
}

export function hasNewLearnings(learnings: LearnedInfo): boolean {
  return (
    learnings.topics.length > 0 ||
    learnings.preferences.length > 0 ||
    learnings.facts.length > 0 ||
    learnings.interests.length > 0
  );
}

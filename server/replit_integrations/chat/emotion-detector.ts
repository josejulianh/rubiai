// Emotion detection utilities for Phase 2
// Detects user emotions from text to adapt Rubi's responses

export type EmotionType = "happy" | "sad" | "angry" | "excited" | "anxious" | "curious" | "frustrated" | "neutral";
export type MoodType = "happy" | "thinking" | "excited" | "calm" | "surprised";

interface EmotionResult {
  primaryEmotion: EmotionType;
  confidence: number;
  suggestedMood: MoodType;
  toneAdjustment: string;
}

// Emotion keyword patterns (word-based only, no emoji)
const emotionPatterns: Record<EmotionType, RegExp[]> = {
  happy: [
    /\b(happy|glad|great|awesome|amazing|wonderful|love|excited|fantastic|brilliant|excellent|perfect|incredible)\b/i,
    /\b(thank|thanks|gracias|genial|increible|maravilloso|excelente)\b/i,
    /\b(joy|joyful|delighted|pleased|cheerful|content|satisfied)\b/i,
  ],
  sad: [
    /\b(sad|upset|depressed|down|crying|disappointed|unhappy|miserable|heartbroken|devastated)\b/i,
    /\b(triste|mal|llorar|desanimado|deprimido)\b/i,
    /\b(hopeless|despair|grief|sorrow|melancholy|gloomy)\b/i,
  ],
  angry: [
    /\b(angry|mad|furious|annoyed|irritated|hate|enraged|outraged|livid)\b/i,
    /\b(enfadado|molesto|odio|furioso|rabioso)\b/i,
    /\b(disgusted|fed up|sick of|tired of)\b/i,
  ],
  excited: [
    /\b(excited|thrilled|can't wait|pumped|stoked|eager|anticipating|hyped)\b/i,
    /\b(emocionado|entusiasmado|ansioso|ilusionado)\b/i,
    /!{2,}/, // Multiple exclamation marks indicate excitement
  ],
  anxious: [
    /\b(worried|anxious|nervous|stressed|scared|afraid|concerned|overwhelmed|panicking)\b/i,
    /\b(preocupado|nervioso|estresado|asustado|agobiado)\b/i,
    /\b(terrified|frightened|uneasy|restless|tense)\b/i,
  ],
  curious: [
    /\b(curious|wondering|interested|want to know|how|why|what|explain)\b/i,
    /\b(curioso|interesado|pregunto|como|porque|que)\b/i,
    /\?{1,}/, // Questions indicate curiosity
  ],
  frustrated: [
    /\b(stuck|confused|don't understand|help|struggling|difficult|hard|impossible|lost)\b/i,
    /\b(no entiendo|dificil|atascado|confundido|perdido)\b/i,
    /\b(complicated|overwhelming|giving up|hopeless|broken)\b/i,
  ],
  neutral: [],
};

// Map emotions to Rubi avatar moods
const emotionToMood: Record<EmotionType, MoodType> = {
  happy: "happy",
  sad: "calm",
  angry: "calm",
  excited: "excited",
  anxious: "thinking",
  curious: "thinking",
  frustrated: "thinking",
  neutral: "happy",
};

// Tone adjustments based on detected emotion
const emotionToneAdjustments: Record<EmotionType, string> = {
  happy: "Match the user's positive energy. Be enthusiastic and celebratory.",
  sad: "Be extra gentle, supportive, and empathetic. Offer comfort and understanding.",
  angry: "Stay calm and patient. Acknowledge their frustration and help find solutions.",
  excited: "Share their excitement! Use energetic language and encourage their enthusiasm.",
  anxious: "Be reassuring and calm. Break things down into manageable steps. Offer support.",
  curious: "Engage their curiosity with interesting details and encourage exploration.",
  frustrated: "Be patient and helpful. Offer clear, step-by-step guidance. Validate their struggle.",
  neutral: "Be friendly and engaging. Look for opportunities to add value to the conversation.",
};

export function detectEmotion(text: string): EmotionResult {
  const scores: Record<EmotionType, number> = {
    happy: 0,
    sad: 0,
    angry: 0,
    excited: 0,
    anxious: 0,
    curious: 0,
    frustrated: 0,
    neutral: 0,
  };

  // Calculate scores for each emotion
  for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        scores[emotion as EmotionType] += matches.length;
      }
    }
  }

  // Find the highest scoring emotion
  let primaryEmotion: EmotionType = "neutral";
  let maxScore = 0;

  for (const [emotion, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      primaryEmotion = emotion as EmotionType;
    }
  }

  // Calculate confidence (0-1)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? maxScore / totalScore : 0;

  return {
    primaryEmotion,
    confidence,
    suggestedMood: emotionToMood[primaryEmotion],
    toneAdjustment: emotionToneAdjustments[primaryEmotion],
  };
}

export function generateContextPrompt(
  responseMode: string,
  communicationStyle: string,
  detectedEmotion: EmotionResult,
  userContext?: string | null,
  favoriteTopics?: string[]
): string {
  let contextPrompt = "\n\n--- USER CONTEXT & PREFERENCES ---\n";

  // Response mode
  if (responseMode === "expert") {
    contextPrompt += "\nRESPONSE MODE: Expert\n- Use technical terminology when appropriate\n- Provide detailed, comprehensive explanations\n- Include relevant technical details and nuances\n- Be precise and thorough";
  } else if (responseMode === "casual") {
    contextPrompt += "\nRESPONSE MODE: Casual\n- Keep explanations simple and accessible\n- Use everyday language, avoid jargon\n- Be brief and to the point\n- Focus on practical takeaways";
  } else {
    contextPrompt += "\nRESPONSE MODE: Balanced\n- Adapt complexity based on the question\n- Use clear language with technical terms only when needed\n- Balance thoroughness with accessibility";
  }

  // Communication style
  if (communicationStyle === "formal") {
    contextPrompt += "\n\nCOMMUNICATION STYLE: Formal\n- Use professional, polished language\n- Be respectful and measured\n- Avoid slang and casual expressions";
  } else if (communicationStyle === "playful") {
    contextPrompt += "\n\nCOMMUNICATION STYLE: Playful\n- Add humor and wit where appropriate\n- Use playful language and expressions\n- Keep the mood light and fun";
  } else {
    contextPrompt += "\n\nCOMMUNICATION STYLE: Friendly\n- Be warm and approachable\n- Use conversational language\n- Balance professionalism with warmth";
  }

  // Emotional adaptation
  if (detectedEmotion.primaryEmotion !== "neutral") {
    contextPrompt += `\n\nDETECTED EMOTION: ${detectedEmotion.primaryEmotion} (confidence: ${Math.round(detectedEmotion.confidence * 100)}%)\n${detectedEmotion.toneAdjustment}`;
  }

  // User context (learned info)
  if (userContext) {
    contextPrompt += `\n\nUSER BACKGROUND:\n${userContext}`;
  }

  // Favorite topics
  if (favoriteTopics && favoriteTopics.length > 0) {
    contextPrompt += `\n\nUSER'S FAVORITE TOPICS: ${favoriteTopics.join(", ")}\n- Reference these interests when relevant\n- Look for connections to topics they enjoy`;
  }

  contextPrompt += "\n--- END USER CONTEXT ---\n";

  return contextPrompt;
}

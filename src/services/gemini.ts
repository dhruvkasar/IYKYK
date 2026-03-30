import { GoogleGenAI, Type } from '@google/genai';

export async function generateRiddle(category: string, difficulty: string, seenAnswers: string[] = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key is missing. Please configure your Gemini API key in the settings.');
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const avoidPrompt = seenAnswers.length > 0 
    ? `\nCRITICAL: DO NOT generate a riddle whose answer is in this list: ${seenAnswers.join(', ')}.` 
    : '';

  let prompt = `Generate a unique, creative riddle for a game.
Category: ${category}
Difficulty: ${difficulty}${avoidPrompt}

Return a JSON object with:
- riddle: The riddle text
- answer: The exact, short answer (1-3 words)
- hint: A helpful hint that doesn't give away the full answer
- fun_fact: A fun fact related to the answer

Make sure it's appropriate for all ages. Never repeat common riddles.`;

  if (category === 'Desi Relatable Reel Riddles') {
    prompt = `You are generating a riddle for a game.
Category: ${category}
Difficulty: ${difficulty}${avoidPrompt}

CRITICAL CONTEXT FOR THIS CATEGORY:
Create a riddle specifically designed for Indian Gen Z audiences.
The riddles must be short, engaging, and instantly relatable, inspired by everyday Indian life, emotions, and digital habits. Use a Hinglish tone (natural mix of Hindi and English) to make the content feel authentic, conversational, and culturally relevant.
Focus on themes such as college life, hostel experiences, Indian parents, exams, procrastination, overthinking, friendships, relationships, and heavy usage of platforms like Instagram, WhatsApp, and late-night scrolling habits. The riddles should feel personal and reflective of real-life situations rather than abstract or purely logical puzzles.
Each riddle should be concise and easy to understand within a few seconds, but still thought-provoking enough to trigger curiosity. The answers should be simple, relatable concepts such as emotions, habits, common behaviors, or familiar social situations.
Incorporate different tones within the category:
Some riddles should be humorous and meme-like, some should be emotional or introspective, and some should reflect common social media behaviors. Maintain a balance between fun, chaos, and subtle depth.
Use hooks at the beginning of riddles when appropriate, such as challenges or curiosity triggers (for example, implying difficulty or relatability), but keep them natural and not overly exaggerated.
Avoid formal language, complex vocabulary, or academic-style riddles. The content should feel like something a young person would read and immediately relate to or share with friends.
Ensure that the overall category captures the essence of "this is so relatable" and "this feels like my life," making it highly shareable and emotionally engaging for Indian Gen Z users.

Return a JSON object with:
- riddle: The riddle text in Hinglish
- answer: The exact, short answer (1-3 words, can be in English or common Hinglish)
- hint: A helpful hint in Hinglish
- fun_fact: A fun fact related to the answer in Hinglish`;
  } else if (category === 'Overthinkers Club: Only Legends Solve This') {
    prompt = `You are generating a riddle for a game.
Category: ${category}
Difficulty: ${difficulty}${avoidPrompt}

CRITICAL CONTEXT FOR THIS CATEGORY:
Create a riddle content category titled "Overthinkers Club: Only Legends Solve This," designed specifically to attract and retain Indian Gen Z audiences by combining emotional relatability with a strong sense of identity and challenge.
The riddles should reflect the inner thoughts, overthinking patterns, late-night emotions, and mental loops that many young people experience, especially in contexts like studies, relationships, social pressure, self-doubt, and digital life. The content must feel deeply personal, as if it understands the user's mind, while also subtly challenging them to prove their intelligence or self-awareness.
Use a Hinglish tone (natural mix of Hindi and English) that feels conversational, raw, and authentic. Avoid formal or academic language. The riddles should sound like thoughts a person might have during late nights, moments of stress, or introspection.
Each riddle should be short and quick to read, but layered with meaning. The answer should often be abstract concepts such as emotions, habits, or psychological states (for example: overthinking, fear, expectations, insecurity, attachment, procrastination), rather than physical objects.
Incorporate two core tones consistently:
First, an emotional and introspective tone that makes the user feel understood, using lines that reflect common inner struggles or relatable situations.
Second, a challenge-driven tone that creates a sense of exclusivity and ego, implying that only certain people (for example, deep thinkers or "legends") can solve or truly understand the riddle.
The riddles should subtly create a feeling of belonging, as if the user is part of a specific group that thinks differently or feels more deeply than others. At the same time, they should trigger curiosity and self-reflection.
Avoid overly obvious answers, but do not make the riddles unnecessarily complex. The ideal balance is that the user pauses, reflects, and then feels a sense of realization or connection when they understand the answer.
Ensure variation within the category by including:
- Riddles about overthinking and mental loops
- Riddles about relationships, attachment, and emotional confusion
- Riddles about self-doubt, comparison, and pressure
- Riddles about habits like procrastination, late-night scrolling, and distraction
- Riddles that feel like hidden truths about life or human behavior
Maintain a consistent emotional depth across all riddles, while occasionally adding sharp, impactful lines that feel like a "reality check."

Return a JSON object with:
- riddle: The riddle text in Hinglish
- answer: The exact, short answer (1-3 words, can be in English or common Hinglish)
- hint: A helpful hint in Hinglish
- fun_fact: A fun fact related to the answer in Hinglish`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 1.2, // High temperature for maximum creativity and randomness
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riddle: { type: Type.STRING, description: "The riddle text" },
            answer: { type: Type.STRING, description: "The exact, short answer (1-3 words)" },
            hint: { type: Type.STRING, description: "A helpful hint that doesn't give away the full answer" },
            fun_fact: { type: Type.STRING, description: "A fun fact related to the answer" },
          },
          required: ['riddle', 'answer', 'hint', 'fun_fact'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from AI');
    
    return JSON.parse(text) as {
      riddle: string;
      answer: string;
      hint: string;
      fun_fact: string;
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error('Failed to generate riddle. Please check your connection and try again.');
  }
}

import express from 'express';

const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const LANG_LABELS = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam',
  kn: 'Kannada', mr: 'Marathi', bn: 'Bengali', es: 'Spanish', fr: 'French',
};

function parseAndNormalize(raw) {
  const cleaned = raw.replace(/^```json\s*|\s*```$/g, '').trim();
  const parsed = JSON.parse(cleaned);
  const suggestions = Array.isArray(parsed) ? parsed : [parsed];
  return suggestions.slice(0, 10).map((q) => ({
    questionType: q.questionType === 'fill_blank' ? 'fill_blank' : (q.questionType === 'multiple' ? 'multiple' : 'single'),
    questionText: q.questionText || q.question_text || '',
    options: q.options || null,
    correctAnswers: q.correctAnswers || q.correct_answers || null,
  }));
}

// Try in order; Google AI Studio free tier may expose different models
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-002',
  'gemini-pro',
];

async function callGeminiModel(model, prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || res.statusText || 'Gemini request failed';
    const isQuota = res.status === 429 || /quota|rate limit|billing|exceeded/i.test(msg);
    const e = new Error(msg);
    e.isQuota = isQuota;
    throw e;
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no text');
  return text;
}

async function generateWithGemini(prompt, apiKey) {
  let lastError;
  for (const model of GEMINI_MODELS) {
    try {
      return await callGeminiModel(model, prompt, apiKey);
    } catch (e) {
      lastError = e;
      if (e.isQuota) throw e;
      const msg = (e.message || '').toLowerCase();
      if (msg.includes('not found') || msg.includes('not supported')) continue;
      throw e;
    }
  }
  throw lastError || new Error('No Gemini model available');
}

async function generateWithOpenAI(systemPrompt, userPrompt, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || res.statusText || 'OpenAI request failed');
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '[]';
}

router.post('/generate-questions', async (req, res) => {
  try {
    const { content, language = 'en', count = 5 } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, message: 'content (string) is required' });
    }
    const text = content.trim().slice(0, 6000);
    const langLabel = LANG_LABELS[language] || language;
    const numQuestions = Math.min(Number(count) || 5, 10);

    const systemPrompt = `You are a quiz question generator. Given lesson or article content, generate ${numQuestions} assessment questions. Return ONLY a valid JSON array, no other text. Each item must have: questionType (one of "single", "multiple", "fill_blank"), questionText (string), and either options (array of {id, text, correct} for single/multiple) or correctAnswers (array of strings for fill_blank). Use "${langLabel}" for question and option text. Mix question types.`;
    const userPrompt = `Generate questions from this content (language: ${langLabel}):\n\n${text}`;

    if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI not configured. Set GEMINI_API_KEY (free: aistudio.google.com) or OPENAI_API_KEY in server .env. You can also add questions manually.',
      });
    }

    let raw;
    if (GEMINI_API_KEY) {
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      raw = await generateWithGemini(fullPrompt, GEMINI_API_KEY);
    } else {
      raw = await generateWithOpenAI(systemPrompt, userPrompt, OPENAI_API_KEY);
    }

    if (!raw || raw === '[]') {
      return res.status(502).json({
        success: false,
        message: 'AI returned no questions. Try again or add questions manually.',
      });
    }

    let normalized;
    try {
      normalized = parseAndNormalize(raw);
    } catch (_) {
      return res.status(502).json({
        success: false,
        message: 'AI returned invalid JSON. Try again or create questions manually.',
      });
    }

    res.json({ success: true, data: normalized });
  } catch (err) {
    console.error('AI generate-questions error:', err);
    const msg = err.message || 'AI service error';
    const isQuota = err.isQuota || /quota|rate limit|billing|exceeded/i.test(msg);
    const status = isQuota ? 503 : 500;
    const friendlyMessage = isQuota
      ? 'AI free-tier quota exceeded. Wait a few minutes and try again, add questions manually, or set OPENAI_API_KEY for an alternative.'
      : msg;
    res.status(status).json({ success: false, message: friendlyMessage });
  }
});

export default router;

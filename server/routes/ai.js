import express from 'express';

const router = express.Router();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post('/generate-questions', async (req, res) => {
  try {
    const { content, language = 'en', count = 5 } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, message: 'content (string) is required' });
    }
    const text = content.trim().slice(0, 6000);
    if (!OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI question generation is not configured. Set OPENAI_API_KEY in server .env to use this feature. You can also use NoteGPT or ChatGPT manually and paste questions here.',
      });
    }
    const langLabel = { en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam', kn: 'Kannada', mr: 'Marathi', bn: 'Bengali', es: 'Spanish', fr: 'French' }[language] || language;
    const systemPrompt = `You are a quiz question generator. Given lesson or article content, generate ${Math.min(Number(count) || 5, 10)} assessment questions. Return ONLY a valid JSON array, no other text. Each item must have: questionType (one of "single", "multiple", "fill_blank"), questionText (string), and either options (array of {id, text, correct} for single/multiple) or correctAnswers (array of strings for fill_blank). Use "${langLabel}" for question and option text. Mix question types.`;
    const userPrompt = `Generate questions from this content (language: ${langLabel}):\n\n${text}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        message: err.error?.message || response.statusText || 'AI request failed',
      });
    }
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '[]';
    let suggestions = [];
    try {
      const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ''));
      suggestions = Array.isArray(parsed) ? parsed : [parsed];
    } catch (_) {
      return res.status(502).json({
        success: false,
        message: 'AI returned invalid JSON. Try again or create questions manually.',
      });
    }
    const normalized = suggestions.slice(0, 10).map((q, i) => ({
      questionType: q.questionType === 'fill_blank' ? 'fill_blank' : (q.questionType === 'multiple' ? 'multiple' : 'single'),
      questionText: q.questionText || q.question_text || '',
      options: q.options || null,
      correctAnswers: q.correctAnswers || q.correct_answers || null,
    }));
    res.json({ success: true, data: normalized });
  } catch (err) {
    console.error('AI generate-questions error:', err);
    res.status(500).json({ success: false, message: err.message || 'AI service error' });
  }
});

export default router;

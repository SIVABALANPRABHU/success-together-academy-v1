import express from 'express';
import Question from '../models/Question.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, question_type, language, limit, offset } = req.query;
    const filters = {
      search: search || undefined,
      question_type: question_type || undefined,
      language: language || undefined,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    };
    const [questions, total] = await Promise.all([
      Question.findAll(filters),
      Question.count(filters),
    ]);
    res.json({ success: true, data: questions, total });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(parseInt(req.params.id));
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, data: question });
  } catch (err) {
    console.error('Error fetching question:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, question_type, question_text, options, correct_answers, language, created_by } = req.body;
    if (!question_type || !question_text) {
      return res.status(400).json({ success: false, message: 'question_type and question_text are required' });
    }
    if (!['single', 'multiple', 'fill_blank'].includes(question_type)) {
      return res.status(400).json({ success: false, message: 'question_type must be single, multiple, or fill_blank' });
    }
    const question = await Question.create({
      title,
      question_type,
      question_text,
      options: options || null,
      correct_answers: correct_answers || null,
      language: language || 'en',
      created_by,
    });
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const question = await Question.findById(parseInt(req.params.id));
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    const updated = await Question.update(parseInt(req.params.id), req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findById(parseInt(req.params.id));
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    await Question.delete(parseInt(req.params.id));
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

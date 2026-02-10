import express from 'express';
import Assessment from '../models/Assessment.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, limit, offset } = req.query;
    const filters = {
      search,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    };
    const assessments = await Assessment.findAll(filters);
    res.json({ success: true, data: assessments });
  } catch (err) {
    console.error('Error fetching assessments:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/by-content/:contentId', async (req, res) => {
  try {
    const assessment = await Assessment.findByContentId(parseInt(req.params.contentId));
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found for this content' });
    }
    const questions = await Assessment.getQuestions(assessment.id);
    res.json({ success: true, data: { ...assessment, questions } });
  } catch (err) {
    console.error('Error fetching assessment by content:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(parseInt(req.params.id));
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    const questions = await Assessment.getQuestions(assessment.id);
    res.json({ success: true, data: { ...assessment, questions } });
  } catch (err) {
    console.error('Error fetching assessment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { content_id, title, description, created_by } = req.body;
    if (!content_id || !title) {
      return res.status(400).json({ success: false, message: 'content_id and title are required' });
    }
    const assessment = await Assessment.create({ content_id, title, description, created_by });
    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    console.error('Error creating assessment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(parseInt(req.params.id));
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    const updated = await Assessment.update(parseInt(req.params.id), req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating assessment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(parseInt(req.params.id));
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    await Assessment.delete(parseInt(req.params.id));
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (err) {
    console.error('Error deleting assessment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/questions', async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id);
    const { question_id, order_index } = req.body;
    if (!question_id) {
      return res.status(400).json({ success: false, message: 'question_id is required' });
    }
    await Assessment.addQuestion(assessmentId, parseInt(question_id), order_index ?? 0);
    const questions = await Assessment.getQuestions(assessmentId);
    res.json({ success: true, data: questions });
  } catch (err) {
    console.error('Error adding question to assessment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id/questions/:questionId', async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id);
    const questionId = parseInt(req.params.questionId);
    await Assessment.removeQuestion(assessmentId, questionId);
    const questions = await Assessment.getQuestions(assessmentId);
    res.json({ success: true, data: questions });
  } catch (err) {
    console.error('Error removing question from assessment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/questions/order', async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id);
    const { question_ids } = req.body;
    if (!Array.isArray(question_ids)) {
      return res.status(400).json({ success: false, message: 'question_ids array is required' });
    }
    const questions = await Assessment.reorderQuestions(assessmentId, question_ids);
    res.json({ success: true, data: questions });
  } catch (err) {
    console.error('Error reordering questions:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

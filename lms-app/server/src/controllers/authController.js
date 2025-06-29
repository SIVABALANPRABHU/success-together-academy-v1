const { userModel } = require('../models/userModel');

exports.getUser = async (req, res) => {
  const { clerkId } = req.params;
  try {
    const user = await userModel.getUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.upsertUser = async (req, res) => {
  const { clerkId, firstName, lastName, role } = req.body;
  try {
    const user = await userModel.upsertUser({ clerkId, firstName, lastName, role });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

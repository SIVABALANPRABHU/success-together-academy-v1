exports.handleError = (res, status, message) => {
  res.status(status).json({ error: message });
};

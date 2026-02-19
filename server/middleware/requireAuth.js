const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: 'Not authenticated',
      message: 'Please log in to continue.'
    });
  }

  return next();
};

module.exports = requireAuth;

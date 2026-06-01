// Validation helpers — keep controllers clean
// These run as middleware before the controller function

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push("Name must be at least 2 characters");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("Valid email is required");

  if (!password || password.length < 6)
    errors.push("Password must be at least 6 characters");

  if (errors.length > 0)
    return res.status(400).json({ message: errors[0], errors });

  // Sanitize
  req.body.name  = name.trim();
  req.body.email = email.toLowerCase().trim();
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  req.body.email = email.toLowerCase().trim();
  next();
}

module.exports = { validateRegister, validateLogin };

function validateCreateTicket(req, res, next) {
  const { category, issue, priority } = req.body;
  const errors = [];

  if (!category || category.trim().length === 0)
    error.push("Category is required");

  if (!issue || issue.trim().length < 3)
    error.push("Issue description given must be least 3 characters");

  const validatorPriority = Object.values(Ticket_Priority);
  if (!priority || !validatorPriority.includes(priority))
    error.push(
      "priorities must be one of the defined values:",
      `${validatorPriority.join(",")}`,
    );

  if (error.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
    req.body.category = cotegory.trim();
    req.body.issue = issue.trim();
    next();
  }
}

function validateStatusUpdate(req, res, next) {
  const { status } = req.body;
  const validStatuses = Object.values(Ticket_status);
  if (!status || !validStatuses.includes(status))
    return res
      .status(400)
      .json({
        message: `status mist be one of them: ${validStatuses.join(",")}`,
      });
}

module.exports = { validateCreateTicket, validateStatusUpdate };

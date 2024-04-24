const requireAdmin = (req, res, next) => {
  const user = res.locals.user

  if (user.role !== 'admin') {
    return res.status(401).send(createApiResponse(false, null, 'Unauthorized'))
  }

  return next()
}

module.exports = requireAdmin
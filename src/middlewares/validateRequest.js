const createApiResponse = require("../utils/createApiResponse");

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params
    }, { abortEarly: false } )

    return next()
  } catch (err) {
    const errors = {};
    err.inner?.forEach(err => {
      const path = err.path.replace(/^(body|params|query)\./, '');
      errors[path] = err.message;
    });

    return res.status(400).send(createApiResponse(false, null, Object.values(errors)[0]))
  }
}

module.exports = validate
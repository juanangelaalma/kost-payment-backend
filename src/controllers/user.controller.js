const UserService = require("../services/user.service")
const createApiResponse = require("../utils/createApiResponse")

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = await UserService.findByEmailPassword(email, password)

    if (!user) {
      return res.status(401).send(createApiResponse(false, null, "Email atau password salah!"))
    }

    const responseData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }

    return res.status(200).send(createApiResponse(true, responseData, null))
  } catch (error) {
    return res.status(500).send(createApiResponse(false, null, error.message))
  }
}

const UserController = {
  loginHandler
}

module.exports = UserController
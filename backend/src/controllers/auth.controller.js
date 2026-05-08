const authService = require('../services/auth.service')

const register = async (req, res) => {
    const { name, email, password } = req.body

    const result = await authService.register({
        name,
        email,
        password,
    })

    return res.status(201).json(result)
}

const login = async (req, res) => {
    const { email, password } = req.body

    const result = await authService.login({
        email,
        password,
    })

    return res.json(result)
}

const me = async (req, res) => {
    const user = await authService.me(req.user.id)

    return res.json(user)
}

module.exports = {
    register,
    login,
    me,
}
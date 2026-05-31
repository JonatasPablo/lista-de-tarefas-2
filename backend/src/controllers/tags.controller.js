const tagsService = require('../services/tags.service')
const AppError = require('../errors/AppError')

const CORES_VALIDAS = /^#[0-9a-fA-F]{6}$/

const validarNome = (nome) => {
    if (!nome || typeof nome !== 'string' || !nome.trim()) {
        throw new AppError('O nome da tag é obrigatório.', 400)
    }
    if (nome.trim().length > 40) {
        throw new AppError('O nome da tag deve ter no máximo 40 caracteres.', 400)
    }
    return nome.trim()
}

const validarCor = (cor) => {
    if (!cor) return '#808080'
    if (!CORES_VALIDAS.test(cor)) {
        throw new AppError('A cor deve ser um valor hexadecimal válido (ex: #1a6ef5).', 400)
    }
    return cor
}

const listTags = async (req, res) => {
    const tags = await tagsService.listTags(req.user.id)
    return res.json(tags)
}

const createTag = async (req, res) => {
    const { nome, cor } = req.body
    const tag = await tagsService.createTag(req.user.id, {
        nome: validarNome(nome),
        cor: validarCor(cor),
    })
    return res.status(201).json(tag)
}

const updateTag = async (req, res) => {
    const { id } = req.params
    const { nome, cor } = req.body
    const tag = await tagsService.updateTag(req.user.id, Number(id), {
        nome: validarNome(nome),
        cor: validarCor(cor),
    })
    if (!tag) throw new AppError('Tag não encontrada.', 404)
    return res.json(tag)
}

const deleteTag = async (req, res) => {
    const { id } = req.params
    const deleted = await tagsService.deleteTag(req.user.id, Number(id))
    if (!deleted) throw new AppError('Tag não encontrada.', 404)
    return res.status(204).send()
}

const addTagToTask = async (req, res) => {
    const { id } = req.params
    const { tagId } = req.body
    if (!tagId || !Number.isInteger(Number(tagId))) {
        throw new AppError('tagId inválido.', 400)
    }
    await tagsService.addTagToTask(req.user.id, Number(id), Number(tagId))
    return res.status(204).send()
}

const removeTagFromTask = async (req, res) => {
    const { id, tagId } = req.params
    await tagsService.removeTagFromTask(req.user.id, Number(id), Number(tagId))
    return res.status(204).send()
}

const listTagsForTask = async (req, res) => {
    const { id } = req.params
    const tags = await tagsService.listTagsForTask(req.user.id, Number(id))
    return res.json(tags)
}

module.exports = {
    listTags,
    createTag,
    updateTag,
    deleteTag,
    addTagToTask,
    removeTagFromTask,
    listTagsForTask,
}

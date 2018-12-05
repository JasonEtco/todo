const Joi = require('joi')

module.exports = Joi.object({
  autoAssign: Joi.alternatives(Joi.boolean(), Joi.array().items(Joi.string()), Joi.string()).default(true),
  keyword: Joi.array().items(Joi.string()).single().default(['@todo', 'TODO']),
  bodyKeyword: Joi.array().items(Joi.string()).single().default(['@body', 'BODY']),
  blobLines: Joi.alternatives(Joi.number(), Joi.boolean().valid(false)).default(5),
  caseSensitive: Joi.boolean().default(false),
  label: Joi.alternatives(Joi.boolean(), Joi.array().items(Joi.string()).single()).default(true),
  reopenClosed: Joi.boolean().default(true),
  exclude: Joi.string().allow(null)
})

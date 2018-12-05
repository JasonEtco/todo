const Joi = require('joi')

module.exports = Joi.object({
  autoAssign: Joi.alternatives(Joi.boolean(), Joi.array().items(Joi.string()), Joi.string()).default(true)
    .description('Should **todo** automatically assign a user to the new issue? If `true`, it\'ll assign whoever pushed the code. If a string, it\'ll assign that user by username. You can also give it an array of usernames or `false` to not assign anyone.'),
  keyword: Joi.array().items(Joi.string()).single().default(['@todo', 'TODO'])
    .description('The keyword(s) to use to generate issue titles'),
  bodyKeyword: Joi.array().items(Joi.string()).single().default(['@body', 'BODY'])
    .description('If this is in the line right after the main keyword, it will become the generated issue body.'),
  blobLines: Joi.alternatives(Joi.number(), Joi.boolean().valid(false)).default(5)
    .description('The number of lines of code to show, starting from the keyword.'),
  caseSensitive: Joi.boolean().default(false)
    .description('Should the keyword be case sensitive?'),
  label: Joi.alternatives(Joi.boolean(), Joi.array().items(Joi.string()).single()).default(true)
    .description('Add a label to the new issue. If true, add the `todo` label. If false, don\'t add any label.You can also give it a label name or an array of label names.'),
  reopenClosed: Joi.boolean().default(true)
    .description('If an issue already exists and is closed, reopen it. Note: if set to false, no new issue will be created.'),
  exclude: Joi.string().allow(null).default(null)
    .description('Exclude certain files and/or directories. Should be a valid regular expression.')
})

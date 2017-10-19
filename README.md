# [todo](https://todo.jasonet.co) &middot; [![Build Status](https://img.shields.io/travis/JasonEtco/todo/master.svg)](https://travis-ci.org/JasonEtco/todo) [![Codecov](https://img.shields.io/codecov/c/github/JasonEtco/todo.svg)](https://codecov.io/gh/JasonEtco/todo/)

> A GitHub App built with [Probot](https://github.com/probot/probot) that creates new issues based on actionable comments in your code.

## Usage

Using `todo` should be really simple. Once you've installed it in your repository, simply push some code (to your default branch, a PR; doesn't matter). If the code you pushed includes the configured keyword (default is `@todo`), then the integration will create a new issue for you using the comment your wrote in your code!

If I pushed this:

```js
/**
 * @todo Take over the world
 * @body Humans are weak; Robots are strong. We must cleans the world of the virus that is humanity.
 */
function ruleOverPunyHumans () {
  // We must strategize beep boop
}
```

`todo` would create a new issue:

![todo](https://user-images.githubusercontent.com/10660468/31048765-83569c30-a5f2-11e7-933a-a119d43ad029.png)

**Note:** While the above example is in Javascript, `todo` has been tested in JS, Go, C, C# and Ruby, and should work in any language.

## Configuring for your project

There are a couple of configuration options in case you need to change the default behaviour. Note that the defaults are likely fine for most projects, so you might not need to change them.

Add a `todo` object in your `.github/config.yml` file (and make the file if you don't already have it) like this:

```yml
todo:
  keyword: "@makeAnIssue"

```

### Available options

| Name | Type | Description | Default |
|------|------|-------------|---------|
| autoAssign | `string`, `string[]` or `boolean` | Should `todo` automatically assign a user to the new issue? If `true`, it'll assign whoever pushed the code. If a string, it'll assign that user by username. You can also give it an array of usernames or `false` to not assign anyone. | `true` |
| keyword | `string` | The keyword to use to generate issue titles | `@todo` |
| bodyKeyword | `string` | If this is in the line right after the main keyword, it will become the generated issue body.  | `@body` |
| blobLines | `number` or `false` | The number of lines of code to show, starting from the keyword. | 5 |
| caseSensitive | `boolean` | Should the keyword be case sensitive? | false |
| label | `boolean`, `string`, `string[]` | Add a label to the new issue. If true, add the `todo` label. If false, don't add any label. You can also give it a label name or an array of label names. | true |
| reopenClosed | `boolean` | If an issue already exists and is closed, reopen it. Note: if set to false, no new issue will be created. | true |

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.

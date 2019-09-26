<p align="center">
  <img src="https://avatars2.githubusercontent.com/in/5534?s=128&v=4" width="64">
  <h3 align="center"><a href="https://todo.jasonet.co">todo[bot]</a></h3>
  <p align="center">A GitHub App built with <a href="https://github.com/probot/probot">Probot</a> that creates new issues based on actionable comments in your code.<p>
  <p align="center"><a href="https://github.com/JasonEtco/actions-toolkit"><img alt="GitHub Actions status" src="https://github.com/JasonEtco/actions-toolkit/workflows/Node%20CI/badge.svg"></a> <a href="https://codecov.io/gh/JasonEtco/todo/"><img src="https://img.shields.io/codecov/c/github/JasonEtco/todo.svg" alt="Codecov"></a>
  </p>
</p>


## Usage

Using **todo** should be really simple. Once you've installed it in your repository, simply push some code (to your default branch, a PR; doesn't matter). If the code you pushed includes one of the configured keywords (defaults are `@todo` and `TODO`), then the integration will create a new issue for you using the comment your wrote in your code!

If I pushed this:

```js
/**
 * @todo Take over the world
 * @body Humans are weak; Robots are strong. We must cleanse the world of the virus that is humanity.
 */
function ruleOverPunyHumans () {
  // We must strategize beep boop
}
```

**todo** would create a new issue:

![todo](https://user-images.githubusercontent.com/10660468/31048765-83569c30-a5f2-11e7-933a-a119d43ad029.png)

**Note:** While the above example is in Javascript, **todo** has been tested in JS, Go, C, C#, Ruby, Bash and Python, and should work in any language.

## Behaviour in pull requests

To reduce noise and keep your **todo** notes in the right context, **todo** comments made in commits that are part of a pull request will be converted into comments on that pull request. When the PR is merged, **todo** will determine which of those **todo**s have yet to be resolved and open an appropriate issue. 

## Configuring for your project

There are a couple of configuration options in case you need to change the default behaviour.

**Note**: Adding a configuration file is **completely optional**. The defaults are likely fine for most projects, so you might not need to change them.

Add a **todo** object in your `.github/config.yml` file (and make the file if you don't already have it) like this:

```yml
todo:
  keyword: "@makeAnIssue"

```

### Available options

<!--DOC GENERATOR-->
| Name | Type | Description | Default |
|------|------|-------------|---------|
| `autoAssign` | `boolean, string[], string` | Should **todo** automatically assign a user to the new issue? If `true`, it'll assign whoever pushed the code. If a string, it'll assign that user by username. You can also give it an array of usernames or `false` to not assign anyone. | `true` |
| `keyword` | `string[]` | The keyword(s) to use to generate issue titles | `['@todo','TODO']` |
| `bodyKeyword` | `string[]` | If this is in the line right after the main keyword, it will become the generated issue body. | `['@body','BODY']` |
| `blobLines` | `number, boolean` | The number of lines of code to show, starting from the keyword. | `5` |
| `caseSensitive` | `boolean` | Should the keyword be case sensitive? | `false` |
| `label` | `boolean, string[]` | Add a label to the new issue. If true, add the `todo` label. If false, don't add any label.You can also give it a label name or an array of label names. | `true` |
| `reopenClosed` | `boolean` | If an issue already exists and is closed, reopen it. Note: if set to false, no new issue will be created. | `true` |
| `exclude` | `string` | Exclude certain files and/or directories. Should be a valid regular expression. | `null` |
<!--ENDDOC GENERATOR-->

## CLI

There is a CLI tool in this repo that you can use to verify that **todo** is working on your commits. This tool will not actually create new issues, but will let you know what issues a commit _would_ create. Follow the setup instructions below, then run:

```
$ node ./bin/todo -o OWNER -r REPO -s SHA
```

You can also parse a local file instead of a sha:

```
$ node ./bin/todo -o OWNER -r REPO -f ./path/to/file.txt
```

Or check a merged PR:

```
$ node ./bin/todo -o OWNER -r REPO --pr NUMBER
```

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.

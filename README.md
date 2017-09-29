# todo

> a GitHub App built with [Probot](https://github.com/probot/probot) that creates new issues based on actionable comments in your code.

## Usage

Using `todo` should be really simple. Once you've installed it in your repository, simply push some code (to your default branch, a PR; doesn't matter). If the code you pushed includes the configured keyword (default is `@todo`), then the integration will create a new issue for you using the comment your wrote in your code!

If I pushed this:

```js
/**
 * Logs a message to the console
 * @todo Change console.log to console.warn
 */
function logger() {
  console.log('Hi!');
}
```

`todo` would create a new issue:

<IMG>

## Configuring for your project

There are a couple of configuration options in case you need to change the default behaviour. Note that the defaults are likely fine for most projects, so you might not need to change them.

Add a file called `todo.yml` in the `.github` folder at the root of your project.

### Available options

| Name | Type | Description | Default |
|------|------|-------------|---------|
| autoAssign | `string`, `string[]` or `boolean` | Should `todo` automatically assign a user to the new issue? If `true`, it'll assign whoever pushed the code. If a string, it'll assign that user by username. You can also give it an array of usernames or `false` to not assign anyone. | `true` |
| keyword | `string` | The keyword to use to generate issue titles | `@todo` |
| blobLines | `number` or `false` | The number of lines of code to show, starting from the keyword. | 5 |
| caseSensitive | `boolean` | Should the keyword be case sensitive? | false |

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.

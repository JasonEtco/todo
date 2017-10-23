# Deploying

If you would like to run your own instance of this app, see the [docs for deployment](https://probot.github.io/docs/deployment/).

This plugin requires these **Permissions** for the GitHub App:

- Issues - **Read & Write**
  - No necessary events
- Pull requests - **Read & Write**
  - No necessary Events
- Repository Contents - **Read-only**

You'll also need to enable the following **Webhook Events**:
  - **Push**
  - **Pull Requests**

To get it up and running on Heroku, simply create a `Procfile` at the root of the app. It should contain:

```
web: npm run serve
```

> :TODO: Add serverless deploy docs
> @body Once #31 has been completed, add docs explaining deployment with serverless.



Open the Remotion Studio:

```
npx remotion studio
```

Render a video locally:

```
npx remotion render
```

Upgrade Remotion:

```
npx remotion upgrade
```

The following script will set up your Remotion Bundle and Lambda function on AWS:

```
node deploy.mjs
```

You should run this script after:

- changing the video template
- changing `config.mjs`
- upgrading Remotion to a newer version

## Set up rendering on AWS Lambda

This template supports rendering the videos via [Remotion Lambda](https://remotion.dev/lambda).

1. Copy the `.env.example` file to `.env` and fill in the values.
   Complete the [Lambda setup guide](https://www.remotion.dev/docs/lambda/setup) to get your AWS credentials.

1. Edit the `config.mjs` file to your desired Lambda settings.

1. Run `node deploy.mjs` to deploy your Lambda function and Remotion Bundle.

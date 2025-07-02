# Railway.com Template for a DiscordJS Bot

## Overview

This code provides a boiler plate for building Discord bots and hosting them on Railway.com

The template implements the initial steps on https://discordjs.guide/ covering the topics (see left bar) under

- INSTALLATIONS & PREPARATIONS
- CREATING YOUR BOT

The above are based on CommonJS code, whereas this boilerplate provides the ESM versions of the code.

Additionally, the boilerplate includes the following:

- railway.json file as per default settings
- NodeJS gitignore
- Scripts in package.json for common tasks

## Installing on local machine

- Create a bot on Discord and install to your Discord server
- Clone git repo to local machine
- Run `npm install`
- Set up your bot configuration using .env.example as a starting point.
- Register the slash commands `npm run register-commands`
- Run `npm run dev`
- Execute one of the slash commands e.g. `/ping`

## To deploy to railway.com

- Create an empty project on railway.com
- Execute commands within `Setup your project locally` (see overlay on bottom left)
- To publish use `railway up`
- You can safely ignore the `` Use `--omit=dev` `` warning in deploy logs i.e
- Execute one of the slash commands e.g. `/ping`
- To switch to local development mode use `railway down` and then execute `npm run dev` locally

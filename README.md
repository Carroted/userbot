# ![icon (eagle from google noto color emoji)](./media/icon.png) `userbot`

`userbot` is a Discord client library for users, developed with the goal to be safe, powerful and undetectable (so users don't get banned).

## Getting Started

### Running the examples

First, install the dependencies:

```sh
bun i
```

Next, you'll need to set up a `.env` file with 3 variables:

```sh
TOKEN="your token here"
SUPER_PROPERTIES="your super properties here"
COOKIE="your cookie here"
```

You can get all 3 from the network tab of your browser's developer tools, there are plenty of tutorials on how to do this.

Finally, run `bun .` for a list of examples, it'll also check if your `.env` file is set up correctly.

### Using the library

First, install the library:

```sh
bun i Carroted/userbot
```

Next, you can use the library similarly to `discord.js`:

```ts
import { Client, Events } from "userbot";

const client = new Client();

client.on(Events.Ready, () => {
  console.log("Ready!");
});

client.login(
  process.env.TOKEN,
  process.env.SUPER_PROPERTIES,
  process.env.COOKIE
);
```

You'll need to do the same environment variable setup as the examples to get the `TOKEN`, `SUPER_PROPERTIES` and `COOKIE`.

## Features

- Simulates client behaviour such as realistic channel navigation and fetching Discord's CDN assets
- Simple discord.js-like API
- Can do most things a normal client can do
- Uses `etf` encoding, this is more efficient and will likely make it harder for Discord to detect you're using a bot, since almost every bot uses JSON encoding
  - In fact, even `discord.js` only supports JSON encoding, so this is a unique feature that will make the client look like the Discord desktop client for realsies

## Goals

- As safe as possible from Discord's detection
- As powerful as possible

## Why

This library is being primarily developed for Teak, our chat API aggregator. Within Teak, users will be able to connect to platforms like Discord and Matrix all within a single client, with this library being used as the bridge to Discord.

As for why we simulate client behaviour, the reason is simple: Discord could very easily figure out if you're using their official clients or not by checking if you're doing things that a normal client would do. For instance, your average selfbot will probably be using something like a `discord.js` fork, which doesn't simulate client behaviour. This means they won't fetch Discord's CDN assets, they won't navigate channels like a normal client would, they might not even connect to the same Gateway as a user would. This makes it very easy for Discord to detect that you're using a bot if they wanted to, and ban you.

The problem is that we can't really tell what Discord is actually doing to detect bots, so we have to make educated guesses. This means that we have to simulate client behaviour as much as possible, and hope that we don't miss anything. At the same time, the entire point is that it's a minimal library without relying on Discord's own client, so it's not like we can just use Puppeteer to run their client and automate that, compromises must be made.

So the compromise of the library is that your network activity is going to be slightly off, but way more on-point than any other library of its kind.

## FAQ

### Does this break Discord's ToS?

Yes, this library does indeed break Discord's ToS. It is however very important to note that this library is not intended to be used for malicious purposes, such as spamming or raiding. It is intended to be used for handy things such as:

- Bridges
- Helpful automation like relaying a message from your Discord DMs to a smart home device
- Custom clients

However, just because it breaks the ToS of another platform doesn't make it morally wrong or illegal. Just be fully aware you could get banned for using this library.

### Is this a selfbot?

Technically, yes, but calling it a selfbot is misleading as it gives people the wrong impression. Selfbotting implies a bot running on your account, which this library isn't necessarily made for. For instance, if you use this library to make a custom client, while that's technically user automation and selfbotting, you're not running a bot on your account, you're a real user using Discord.

For this reason, the library is best described as a Discord client library for users.

### Is this related to `discord.js`?

No, this library is not related to `discord.js` in any way. It's a completely separate library with a different API, built from the ground up to be a user client library.

However, the API is heavily inspired by `discord.js`, so if you're familiar with that, you should feel right at home. Older users of `discord.js` will also notice that the API is very similar to the older versions of `discord.js`'s API as well.

### Why not just use `discord.js`?

`discord.js` is a great library, but it's not made for user clients. While some people fork `discord.js` to make it work for user clients, it's not really the best solution as `discord.js` is a library made for bots, and Discord can easily detect that you aren't using their official client if you do that.

### Does this use Puppeteer or rely on Discord's client?

Nope! This library is entirely standalone, and doesn't rely on Discord's client or Puppeteer at all. It's a completely custom implementation of a Discord client.

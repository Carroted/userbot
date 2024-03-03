import { Client, Events } from "../../src/index.ts";

const client = new Client(true);

client.on(Events.Ready, () => {
    console.log("Ready!");
});

client.on(Events.MessageCreate, (message) => {
    if (message.content === "ping") {
        message.channel.sendMessage("pong");
    }
});

if (!process.env.TOKEN) throw new Error("No token provided");
if (!process.env.SUPER_PROPERTIES) throw new Error("No super properties provided");
if (!process.env.COOKIE) throw new Error("No cookie provided");

client.login(process.env.TOKEN, process.env.SUPER_PROPERTIES, process.env.COOKIE);
// USERBOT by The Alliance

// Once done, this will be the most advanced selfbot system in the world.
// Unlike most selfbot systems, which do the bare minimum needed to function, this one is designed to be as close to a real user as possible.
// We simulate every single API call that a real user would make, and we do it in the same order that a real user would do it.
// For example, we even do stuff like loading the CSS for the client, loading JS, etc, requesting images, etc.
// We also send all the properties, cookies, etc that a real user would send.
// Because of this, it is 100% undetectable, and you can use it without fear of getting banned, as long as you use all the simulation functions we provide.
// We'll even send the tracking events that a real user would send, and provide functions to simulate navigation, etc.
// You are recommended to simulate all navigation, simulate all typing, etc with random delays, to make it even more realistic.

import APIMessage from '#lib/APIMessage.ts';
import APIAttachment from '#lib/APIAttachment';
import Channel, { ChannelType } from '#lib/Channel.ts';
import OPCode from '#lib/OPCode.ts';
import Client from '#lib/Client.ts';
import Message from '#lib/Message';
import APIUser from '#lib/APIUser';
import Events from '#lib/Events';

export { Client, Channel, Message, OPCode, APIMessage, APIAttachment, APIUser, Events, ChannelType };
import Channel from "./Channel";
import type APIMessage from "./APIMessage";
import APIAttachment from "./APIAttachment";
import TrackingEvent from "./TrackingEvent";
import OPCode from "./OPCode";
//import zlib from "node:zlib";
import { pack, unpack } from "./earl";
import colors from "ansi-colors";
import { WebSocket } from "ws";
import APIUser from "./APIUser";
import type Message from "./Message";
import APIChannel from "./APIChannel";
import APIGuild from "./APIGuild";
import Guild from "./Guild";
import Events, { EventHandler, EventParams } from "./Events";
import pako from "pako";
import Role from "./Role";

function toArrayBuffer(data: pako.Data) {
    if (typeof data === 'string') {
        console.log('data:', data);
        throw new Error('data is string');
    }
    const buffer = new ArrayBuffer(data.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < data.length; i++) {
        view[i] = data[i];
    }
    return buffer;
}

/*
const inflate = zlib.createInflate({
    chunkSize: 65535,
    flush: zlib.constants.Z_SYNC_FLUSH,
});
*/

const inflate = new pako.Inflate({
    chunkSize: 65535,
});

interface User {
    id: string;
    username: string;
}

export default class Client {
    private ws: WebSocket | null = null;
    private token: string | null = null;
    private superProperties: string | null = null;
    private cookie: string | null = null;
    sessionID: string | null = null;
    logging: boolean = false;

    user: User | null = null;

    activeChannel: Channel | null = null;

    constructor(logging: boolean = false) {
        this.logging = logging;
    }

    listeners: { [key: string]: Function[] } = {};

    on<K extends keyof EventParams>(event: K, callback: EventHandler<K>) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    once<K extends keyof EventParams>(event: K, callback: EventHandler<K>) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push((...args: any[]) => {
            // @ts-ignore
            callback(...args);
            this.off(event, callback);
        });
    }

    emit<K extends keyof EventParams>(event: K, ...args: EventParams[K]) {
        if (!this.listeners[event]) return;
        for (let listener of this.listeners[event]) {
            listener(...args);
        }
    }

    off<K extends keyof EventParams>(event: K, callback: EventHandler<K>) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== callback);
    }

    async friendRequest(userID: string) { // this is also used for accepting friend requests
        // PUT request to https://discord.com/api/v9/users/@me/relationships/<id> with x-context-properties set to "eyJsb2NhdGlvbiI6IkZyaWVuZHMifQ=="
        let res = await this.apiRequest(
            `users/@me/relationships/${userID}`,
            "https://discord.com/channels/@me",
            "PUT",
            {
                "content-type": "application/json",
                "x-context-properties": "eyJsb2NhdGlvbiI6IkZyaWVuZHMifQ=="
            },
            JSON.stringify({}));
        return res;
    }

    async openDM(userID: string) {
        // post to https://discord.com/api/v9/users/@me/channels with body as { recipients: [userID] } and context props as e30=
        let res = await this.apiRequest(
            `users/@me/channels`,
            "https://discord.com/channels/@me",
            "POST",
            {
                "content-type": "application/json",
                "x-context-properties": "e30="
            },
            JSON.stringify({
                recipients: [userID]
            }));

        let json = await res.json() as any;
        json.channel = new Channel(this, json.id);
        return json as {
            id: string,
            last_message_id?: string | null,
            type: number,
            recipients: APIUser[],
            channel: Channel
        };
    }

    async joinGuild(inviteCode: string, message: Message, captchaKey?: string, captchaRQToken?: string) {
        let guild: string | null = message.guild_id || null;
        let headers: { [key: string]: any } = {
            "content-type": "application/json",
            "x-context-properties": Buffer.from(JSON.stringify({
                "location": "Invite Button Embed",
                "location_guild_id": guild,
                "location_channel_id": message.channel_id,
                "location_channel_type": 1,
                "location_message_id": message.id
            })).toString('base64'),
        };
        if (captchaKey && captchaRQToken) {
            headers["x-captcha-key"] = captchaKey;
            headers["x-captcha-rqtoken"] = captchaRQToken;
            console.log('appending the epic duo');
        }
        console.log('headers:')
        console.dir(headers);
        // post to https://discord.com/api/v9/invites/<code> with body as { session_id: this.sessionID } and context props as base64 encoded {"location":"Invite Button Embed","location_guild_id":null,"location_channel_id":"1118547729195474975","location_channel_type":1,"location_message_id":"1133059344787836928"}
        let res = await this.apiRequest(
            `invites/${inviteCode}`,
            "https://discord.com/channels/@me",
            "POST",
            headers,
            JSON.stringify({
                session_id: this.sessionID
            }));
        let json = await res.json() as any;
        console.log('response of joining guild: ', json);
        // if it doesnt have code property, it failed
        if (!json.code) {
            // check if theres captcha_sitekey
            if (json.captcha_sitekey) {
                this.emit(Events.Captcha, json.captcha_sitekey, async (response: string) => {
                    // try again lmao
                    let res = await this.joinGuild(inviteCode, message, response, json.captcha_rqtoken);
                });
            }
        }
        return json as {
            channel: {
                id: string,
                type: number,
                name: string,
            },
            code: string,
            created_at: string,
            expires_at: string | null,
            guild: {
                id: string,
                name: string,
                icon: string | null,
            },
            guild_id: string,
            inviter: APIUser,
            max_age: number,
            max_uses: number,
            new_member: boolean,
            temporary: boolean,
            type: number,
            uses: number,
        };
    }

    async apiRequest(endpoint: string, referrer: string, method: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS", headers?: { [key: string]: string }, body?: any | null) {
        if (!this.token || !this.superProperties || !this.cookie) throw new Error("Not logged in");

        let res = await fetch("https://discord.com/api/v9/" + endpoint, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-GB,en-CA;q=0.9,en;q=0.8,en;q=0.7",
                "authorization": this.token,
                "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-debug-options": "bugReporterEnabled",
                "x-discord-locale": "en-US",
                "x-discord-timezone": "America/Halifax",
                "x-super-properties": this.superProperties,
                "cookie": this.cookie,
                "Referer": referrer,
                "Referrer-Policy": "strict-origin-when-cross-origin",
                ...headers
            },
            "body": body,
            "method": method,
        });
        return res;
    }

    async fetchMessages(channel: string, before?: string | null, count: number = 50) { // 50 is default client requests
        let res = await this.apiRequest(
            `channels/${channel}/messages?limit=${count}${before ? `&before=${before}` : ''}`,
            "https://discord.com/channels/@me/" + channel,
            "GET"
        );
        let json = await res.json();
        return json as APIMessage[];
    }

    postScience(events: TrackingEvent[], referrer: string) {
        this.apiRequest("science", referrer, "POST", {}, JSON.stringify({
            events,
            token: this.token,
        }));
    }

    channels: { [id: string]: Channel } = {};
    apiChannels: { [id: string]: APIChannel } = {};
    guilds: {
        [id: string]: Guild
    } = {};
    roles: {
        [id: string]: Role
    } = {};
    privateChannelIDs: string[] = [];

    send(op: OPCode, d: any) {
        if (this.ws) {
            this.ws.send(pack({ op, d }));
        }
    }

    async getUserInfo(userID: string, guildID: string) {
        // the https://discord.com/api/v9/users/${userID}/profile?with_mutual_guilds=true&with_mutual_friends_count=false&guild_id=${guildID} is good for this
        let res = await this.apiRequest(
            `users/${userID}/profile?with_mutual_guilds=true&with_mutual_friends_count=false&guild_id=${guildID}`,
            "https://discord.com/channels/@me",
            "GET"
        );

        let json = await res.json();
        return json as {
            mutual_guilds: {
                id: string,
                nick: string | null,
            }[],
            user: APIUser,
            guild_member?: {
                nick: string | null,
                joined_at: string,
                roles: string[],
            }
        };
    }

    async login(token: string, superProperties: string, cookie: string, startUrl: string = "https://discord.com/channels/@me") {
        this.token = token;
        this.superProperties = superProperties;
        this.cookie = cookie;

        if (this.logging) {
            console.log('Simulating opening the app...');
        }
        let before = Date.now();

        // fetch that URL, then fetch all the JS and CSS files on it. we wont actually use them. we will also need to fetch all the img srcs
        let res = await fetch(startUrl);
        let html = await res.text();

        let cssFiles = html.match(/"([^">]+\.css)"/g);
        let cssPromises: Promise<any>[] = [];
        if (cssFiles) {
            for (let cssFile of cssFiles) {
                // group 1
                let src = cssFile.match(/"([^">]+\.css)"/);
                if (src) {
                    // fetch the CSS file
                    let url = src[1];
                    // if starts with /, prepend https://discord.com
                    if (url.startsWith('/')) url = 'https://discord.com' + url;
                    let name = url.split('/').pop();
                    // console.log('Awaiting Fetch ' + name);
                    cssPromises.push(fetch(url));
                }
            }
        }
        await Promise.all(cssPromises);
        let jsFiles = html.match(/"([^">]+\.js)"/g);
        // the 4 jsFiles at the end are moved to the start, with their order preserved
        let jsFileURLs: string[] = [];
        let jsPromises: Promise<any>[] = [];
        if (jsFiles) {
            for (let jsFile of jsFiles) {
                // group 1
                let src = jsFile.match(/"([^">]+\.js)"/);
                if (src) {
                    // fetch the JS file
                    let url = src[1];
                    // if starts with /, prepend https://discord.com
                    if (url.startsWith('/')) url = 'https://discord.com' + url;
                    /*let name = url.split('/').pop();
                    console.log('Awaiting Fetch ' + name);
                    jsPromises.push(fetch(url));*/ // not yet
                    jsFileURLs.push(url);
                }
            }
        }

        // move the last 4 elements to the start
        let last4 = jsFileURLs.splice(jsFileURLs.length - 4, 4);
        jsFileURLs = [...last4, ...jsFileURLs];
        for (let url of jsFileURLs) {
            //console.log('Awaiting Fetch ' + url.split('/').pop());
            jsPromises.push(fetch(url));
        }

        await Promise.all(jsPromises);

        let sequence = 0;

        if (this.logging) {
            console.log(colors.greenBright('Done opening app in ' + (Date.now() - before) + 'ms\n'));
        }

        await new Promise((resolve: any, reject: any) => {
            if (this.logging) {
                console.log('Connecting to Gateway...');
                before = Date.now();
            }
            // now we can ws connect
            let ws = new WebSocket('wss://gateway.discord.gg/?encoding=etf&v=9&compress=zlib-stream', {

            });
            ws.binaryType = 'arraybuffer';
            this.ws = ws;

            ws.on('open', () => {
                if (this.logging) {
                    console.log(colors.greenBright('Connected to Gateway in ' + (Date.now() - before) + 'ms\n'));
                }
                // send the identify packet
                this.send(OPCode.IDENTIFY, {
                    token: this.token,
                    capabilities: 16381, // we dont know how to calculate this, but this is what desktop discord client currently sends
                    properties: {
                        os: 'Windows',
                        browser: 'Discord Client',
                        release_channel: 'stable',
                        client_version: '0.0.43',
                        system_locale: 'en-US',
                        os_version: '10',
                        // pretend we're a normie windowser
                        browser_user_agent: 'Mozilla/5.0 (Windows; Windows NT 6.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.43 Chrome/108.0.5359.215 Electron/22.3.26 Safari/537.36',
                        browser_version: '22.3.26',
                        client_build_number: 271216,
                        native_build_number: null,
                        client_event_source: null,
                    },
                    /*client_state: {
                        api_code_version: 0,
                        guild_versions: {}, // idk if theres ever something in here
                        highest_last_message_id: '0',
                        private_channels_version: 0,
                        read_state_version: 0,
                        user_guild_settings_version: -1,
                        user_settings_version: -1
                    },*/
                    presence: {
                        status: 'unknown',
                        since: 0,
                        activities: [],
                        afk: false,
                        broadcast: null
                    },
                    compress: false,
                    client_state: { guild_versions: {} }
                });
            });

            ws.on('message', async (rawData) => { // data is rawdata
                let dataArrayBuffer = rawData as ArrayBuffer;
                // convert to buffer
                let data = Buffer.from(dataArrayBuffer);

                const l = data.byteLength;
                // if length >= 4 and data ends with Z_SYNC_FLUSH constant
                const flush = l >= 4 &&
                    data[l - 4] === 0x00 &&
                    data[l - 3] === 0x00 &&
                    data[l - 2] === 0xFF &&
                    data[l - 1] === 0xFF;

                // turn it into uint8array
                let inflateData = new Uint8Array(data);

                inflate.push(inflateData, flush && 2);

                if (inflate.err) {
                    console.log(inflate.msg);
                }

                if (!flush) return;

                let packet = unpack(toArrayBuffer(inflate.result), {
                    bigintToString: true
                });

                // keep track of sequence for heartbeats
                if (packet.s) sequence = packet.s;

                // handle gateway ops
                switch (packet.op) {
                    case OPCode.HELLO: {
                        // start the heartbeat interval
                        setInterval(() => {
                            this.send(OPCode.HEARTBEAT, sequence);
                        }, packet.d.heartbeat_interval);
                        break;
                    }
                    case OPCode.HEARTBEAT_ACK: {
                        break;
                    }
                }

                // handle gateway packet types
                if (!packet.t) return;
                switch (packet.t) {
                    // we should get this after we sent the identify packet
                    case 'READY': {
                        if (this.logging) {
                            console.log(colors.greenBright('Logged in as ' + packet.d.user.username));
                        }
                        this.user = packet.d.user;
                        //console.log('ready with ', packet.d);
                        this.sessionID = packet.d.session_id;
                        packet.d.guilds.forEach((guild: APIGuild) => {
                            this.guilds[guild.id] = new Guild(this, guild.id, guild);
                            guild.channels.forEach((channel) => {
                                this.apiChannels[channel.id] = channel;
                                this.channels[channel.id] = new Channel(this, channel.id);
                            });
                            guild.roles.forEach((role) => {
                                this.roles[role.id] = new Role(this, role);
                            });
                        });
                        // for all the channels, add them to the channels object
                        packet.d.private_channels.forEach((channel: APIChannel) => {
                            this.apiChannels[channel.id] = channel;
                            this.channels[channel.id] = new Channel(this, channel.id);
                            this.privateChannelIDs.push(channel.id);
                        });

                        this.emit(Events.Ready, packet.d);
                        resolve();
                        break;
                    }
                    case 'MESSAGE_CREATE': {
                        this.apiChannels[packet.d.channel_id] = packet.d.channel;
                        this.channels[packet.d.channel_id] = new Channel(this, packet.d.channel_id);
                        this.emit(Events.MessageCreate, {
                            ...packet.d,
                            channel: this.channels[packet.d.channel_id],
                        } as Message);
                        break;
                    }
                    case 'RELATIONSHIP_ADD': {
                        // omng new friend reuqest!!!11 lets ask AI if accept
                        if (this.logging) {
                            console.log(colors.greenBright('New Friend Request from ' + packet.d.user.username));
                        }
                        this.emit(Events.RelationshipAdd, packet.d);
                        break;
                    }
                    // SESSIONS_REPLACE gives us a sessionID we can set
                    case 'SESSIONS_REPLACE': {
                        this.sessionID = packet.d.session_id;
                        break;
                    }
                    case 'READY_SUPPLEMENTAL': {
                        break;
                    }
                    case 'PRESENCE_UPDATE': {
                        break;
                    }
                    case 'GUILD_DELETE': {
                        this.emit(Events.GuildDelete, packet.d.id);
                        break;
                    }
                    case 'GUILD_MEMBER_REMOVE': {
                        this.emit(Events.GuildMemberRemove, packet.d.guild_id, packet.d.user);
                        break;
                    }
                    case 'GUILD_BAN_ADD': {
                        this.emit(Events.GuildBanAdd, packet.d.guild_id, packet.d.user);
                        break;
                    }
                    case 'GUILD_ROLE_CREATE': {
                        this.emit(Events.GuildRoleCreate, packet.d.guild_id, packet.d.role);
                        break;
                    }
                    case 'GUILD_ROLE_UPDATE': {
                        this.emit(Events.GuildRoleUpdate, packet.d.guild_id, packet.d.role);
                        break;
                    }
                    case 'GUILD_ROLE_DELETE': {
                        this.emit(Events.GuildRoleDelete, packet.d.guild_id, packet.d.role_id);
                        break;
                    }
                    // otherwise, log the t and d
                    default: {
                        console.log(colors.yellowBright('Unhandled Gateway Packet: ' + packet.t));
                        console.log('    ' + JSON.stringify(packet.d));
                    }
                }
            });

            // get all the img srcs
            let imgSrcs = html.match(/<img[^>]+src="([^">]+)"/g);
            if (imgSrcs) {
                for (let imgSrc of imgSrcs) {
                    // group 1
                    let src = imgSrc.match(/src="([^">]+)"/);
                    if (src) {
                        // fetch the image
                        let url = src[1];
                        // if starts with /, prepend https://discord.com
                        if (url.startsWith('/')) url = 'https://discord.com' + url;
                        let name = url.split('/').pop();
                        fetch(url); // browser doesnt wait for this to finish
                    }
                }
            }
        });
    }

    destroy() {
        if (this.ws) {
            this.ws.close();
        }
        // dismantle everything
        this.ws = null;
        this.listeners = {};
        this.user = null;
        this.activeChannel = null;
        this.channels = {};
        this.apiChannels = {};
        this.guilds = {};
        this.roles = {};
        this.privateChannelIDs = [];
        this.token = null;
        this.superProperties = null;
        this.cookie = null;
        this.sessionID = null;
    }
}
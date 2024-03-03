import randomRange from "./randomRange";
import Client from "./Client";
import ChannelOpened from "./TrackingEvents/ChannelOpened";
import APIMessage from "./APIMessage";
import Message from "./Message";
import APIChannel from "./APIChannel";

export enum ChannelType {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_ANNOUCEMENT = 5,
    ANNOUNCEMENT_THREAD = 10,
    PUBLIC_THREAD = 11,
    PRIVATE_THREAD = 12,
    GUILD_STAGE_VOICE = 13,
    GUILD_DIRECTORY = 14,
    GUILD_FORUM = 15,
    GUILD_MEDIA = 16,
}

export default class Channel {
    private client: Client;
    readonly id: string;
    get name(): string | undefined {
        return this.client.apiChannels[this.id]?.name;
    }
    get type(): ChannelType {
        return this.client.apiChannels[this.id]?.type;
    }
    get nsfw(): boolean {
        return this.client.apiChannels[this.id]?.nsfw;
    }
    get parentId(): string | null {
        return this.client.apiChannels[this.id]?.parent_id;
    }
    get permissionOverwrites(): {
        allow: string;
        deny: string;
        id: string;
        type: number;
    }[] {
        return this.client.channels[this.id]?.permissionOverwrites;
    }
    get position(): number {
        return this.client.apiChannels[this.id]?.position;
    }
    get rateLimitPerUser(): number | undefined {
        return this.client.apiChannels[this.id]?.rate_limit_per_user;
    }
    get topic(): string | undefined {
        return this.client.apiChannels[this.id]?.topic;
    }
    get lastMessageId(): string | undefined {
        return this.client.apiChannels[this.id]?.last_message_id;
    }
    get lastPinTimestamp(): string | undefined {
        return this.client.apiChannels[this.id]?.last_pin_timestamp;
    }
    /*
        get guildId(): string | undefined {
            return this.client.apiChannels[this.id]?.guild_id;
        }*/

    /** Only create it after client.channels[id] has been set. */
    constructor(client: Client, id: string, guildId?: string) {
        this.client = client;
        this.id = id;
    }

    async sendMessage(content: string, attachment?: Buffer) {
        let body: {
            content: string,
            flags: number,
            has_poggermode_enabled: boolean,
            nonce: number,
            tts: boolean,
            attachments?: any[]
        } = {
            content,
            flags: 0,
            has_poggermode_enabled: true,
            nonce: 0,
            tts: false,
        };
        if (attachment) {
            let res1 = await this.client.apiRequest("channels/" + this.id + "/attachments", 'https://discord.com/channels/@me/' + this.id, "POST", {
                contentType: 'application/json',
                "content-type": 'application/json'
            }, JSON.stringify({
                files: [{
                    file_size: attachment.length,
                    filename: 'image.png',
                    id: '2',
                    is_clip: false,
                }]
            }));
            let res1JSON = await res1.json() as any;
            let url: string = res1JSON.attachments[0].upload_url;

            let res2 = await fetch(url, {
                headers: {
                    contentType: 'image/png',
                    "content-type": 'image/png',
                    origin: 'https://discord.com',
                },
                method: 'PUT',
                body: attachment
            });

            let res2Text = await res2.text();

            body = {
                ...body,
                attachments: res1JSON.attachments.map((a: any, i: number) => {
                    return {
                        id: i.toString(),
                        uploaded_filename: a.upload_filename,
                        filename: 'image.png'
                    };
                })
            };
            console.dir(body)
        }
        let res = await this.client.apiRequest("channels/" + this.id + "/messages", 'https://discord.com/channels/@me/' + this.id, "POST", {
            contentType: 'application/json',
            "content-type": 'application/json'
        }, JSON.stringify(body));

        let resJSON = await res.json() as APIMessage;

        return {
            ...resJSON,
            channel: this
        } as Message;
    }

    async sendTyping() {
        this.client.apiRequest("channels/" + this.id + "/typing", 'https://discord.com/channels/@me/' + this.id, "POST");
    }

    async open() { // simulate opening the channel
        let first50 = await this.client.fetchMessages(this.id);
        // post users/@me/referrals/507690608417046538/preview
        await this.client.apiRequest("users/@me/referrals/507690608417046538/preview", 'https://discord.com/channels/@me/' + this.id, "POST");
        // post science
        let event: ChannelOpened = {
            type: "channel_opened",
            properties: {
                "client_track_timestamp": new Date().getTime(),
                "client_heartbeat_session_id": "798dd101-a668-420d-9dc0-843930d20b4d",
                "channel_is_nsfw": false,
                "can_send_message": false,
                "has_pending_member_action": false,
                "channel_id": "1123381661116157963",
                "channel_type": 1,
                "channel_size_total": 1,
                "channel_member_perms": "0",
                "channel_hidden": false,
                "client_performance_memory": 0,
                "accessibility_features": 524416,
                "rendered_locale": "en-US",
                "accessibility_support_enabled": false,
                "client_uuid": "CiBE5KnfhQ9JMc+u/tRpeokBAAAdAAAA",
                "client_send_timestamp": new Date().getTime(),
            }
        } as ChannelOpened;
        this.client.postScience([event], 'https://discord.com/channels/@me/' + this.id);
        this.client.activeChannel = this;

        return first50;
    }

    async fetchAllMessages(progressCallback?: (messages: APIMessage[]) => void) {
        let messages: APIMessage[] = [];
        let before: string | null = null;
        while (true) {
            //console.log(logPrefix + chalk.hex('#848484')(`Fetching 50 messages (We have `) + messages.length + chalk.hex('#848484')(` messages so far)`));
            let res = await this.client.fetchMessages(this.id, before, 50);
            messages.push(...res);
            if (progressCallback) progressCallback(messages);
            if (res.length < 50) break;
            before = res[res.length - 1].id;
            // wait 3-5 seconds to not get ratelimited
            await new Promise(resolve => setTimeout(resolve, randomRange(10, 500)));
        }
        return messages.reverse().map(m => {
            return {
                id: m.id,
                content: m.content,
                createdAt: m.timestamp,
                author: m.author.id,
                reply_ids: m.referenced_message ? [m.referenced_message.id] : [],
                attachments: m.attachments.map(a => a.proxy_url),
                edited: m.edited_timestamp,
                embeds: m.embeds,
                reactions: m.reactions,
                pinned: m.pinned,
            }
        });
    }

    async fetchMessages(before?: string, count?: number) {
        let messages: APIMessage[] = await this.client.fetchMessages(this.id, before, count);
        return messages.map(m => {
            return {
                ...m,
                channel: this
            }
        }) as Message[];
    }

    async getMessageCount(guildId: string) {
        // https://discord.com/api/v9/guilds/1138303122557644881/messages/search?channel_id=1138303123270664205
        // if it gets 202, we will try again with `&attempts=1`
        // from result, we will get .total_results
        let resJSON: any;
        let i = 0;
        while (true) {
            let suffix = i ? '&attempts=' + i : '';
            let res = await this.client.apiRequest("guilds/" + guildId + "/messages/search?channel_id=" + this.id + suffix, 'https://discord.com/channels/@me/' + this.id, "GET");
            resJSON = await res.json();
            if (resJSON.total_results !== undefined) {
                break;
            }
            else {
                i++;
                if (i > 10) break;
                console.log('didnt get total_results, trying again...', resJSON);
            }
        }
        return resJSON.total_results;
    }

    async deleteMessage(messageId: string) {
        let res = await this.client.apiRequest("channels/" + this.id + "/messages/" + messageId, 'https://discord.com/channels/@me/' + this.id, "DELETE");
        // log res stringified without indent or anything

        try { console.log(JSON.stringify(await res.json())); }
        catch (e) { console.log('no json'); }
    }


}
import APIAttachment from "./APIAttachment.js";
import APIUser from "./APIUser.js";

export default interface APIMessage {
    // anything that we arent 100% sure of the format of yet is any for now
    attachments: APIAttachment[];
    author: APIUser;
    channel_id: string;
    guild_id: string | undefined;
    components: any[];
    content: string;
    edited_timestamp: string | null;
    embeds: any[];
    flags: number;
    id: string;
    mention_everyone: boolean;
    mention_roles: string[];
    mentions: APIUser[];
    pinned: boolean;
    timestamp: string;
    tts: boolean;
    type: number;
    webhook_id: string | undefined;
    referenced_message: APIMessage | undefined;
    reactions: any[] | undefined;
    member: {
        avatar: string | null;
        nick: string | null;
        joined_at: string;
        roles: string[];
    } | undefined;
}
import APIGuild from "./APIGuild";
import Channel from "./Channel";
import Client from "./Client";

export default class Guild {
    private client: Client;
    readonly id: string;
    readonly name: string;
    readonly icon: string | null;
    readonly channels: Channel[];
    readonly roles: {
        color: number;
        flags: number;
        hoist: boolean;
        icon: any | null;
        id: string;
        managed: boolean;
        mentionable: boolean;
        name: string;
        permissions: string;
        position: number;
        tags?: any
    }[];
    readonly memberCount: number;
    readonly joinedAt: string;
    readonly ownerId: string;
    readonly emojis: any[];

    constructor(client: Client, id: string, apiGuild: APIGuild) {
        this.client = client;
        this.id = id;

        this.name = apiGuild.properties.name;
        this.icon = apiGuild.properties.icon;
        this.channels = apiGuild.channels.map(channel => new Channel(this.client, channel.id));
        this.roles = apiGuild.roles;
        this.memberCount = apiGuild.member_count;
        this.joinedAt = apiGuild.joined_at;
        this.ownerId = apiGuild.properties.owner_id;
        this.emojis = apiGuild.emojis;
    }
}
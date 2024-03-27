import APIGuild from "./APIGuild";
import APIRole from "./APIRole";
import Client from "./Client";

export default class Guild {
    private client: Client;
    readonly id: string;
    readonly name: string;
    readonly hoist?: boolean;
    readonly icon: any | null;
    readonly managed: boolean;
    readonly mentionable: boolean;
    readonly permissions: string;
    readonly position: number;
    readonly unicode_emoji?: string | null;
    readonly version?: number;

    constructor(client: Client, apiRole: APIRole) {
        this.client = client;
        this.id = apiRole.id;
        this.name = apiRole.name;
        this.hoist = apiRole.hoist;
        this.icon = apiRole.icon;
        this.managed = apiRole.managed;
        this.mentionable = apiRole.mentionable;
        this.permissions = apiRole.permissions;
        this.position = apiRole.position;
        this.unicode_emoji = apiRole.unicode_emoji;
        this.version = apiRole.version;
    }
}
import APIRole from "./APIRole";
import APIUser from "./APIUser";
import type Message from "./Message";

enum Events {
    Ready = "READY",
    MessageCreate = "MESSAGE_CREATE",
    RelationshipAdd = "RELATIONSHIP_ADD",
    Captcha = "CAPTCHA",
    GuildBanAdd = "GUILD_BAN_ADD",
    MessageUpdate = "MESSAGE_UPDATE",
    MessageDelete = "MESSAGE_DELETE",
    GuildRoleDelete = "GUILD_ROLE_DELETE",
    GuildDelete = "GUILD_DELETE",
    GuildMemberRemove = "GUILD_MEMBER_REMOVE",
    GuildRoleUpdate = "GUILD_ROLE_UPDATE",
    TypingStart = "TYPING_START",
    GuildRoleCreate = "GUILD_ROLE_CREATE",
};

interface EventParams {
    [Events.Ready]: [void];
    [Events.MessageCreate]: [message: Message];
    [Events.RelationshipAdd]: [any];
    [Events.Captcha]: [string, (response: string) => Promise<void>];
    [Events.GuildDelete]: [guildID: string];
    [Events.GuildMemberRemove]: [guildID: string, user: APIUser];
    [Events.GuildBanAdd]: [guildID: string, user: APIUser];
    [Events.GuildRoleCreate]: [guildID: string, role: APIRole];
    [Events.GuildRoleUpdate]: [guildID: string, role: APIRole];
    [Events.GuildRoleDelete]: [guildID: string, roleID: string]; // discord also sends a version field, but we dont have a clue what that is or a use for it
};

type EventHandler<T extends keyof EventParams> = (...params: EventParams[T]) => void;

export default Events;
export type { EventParams, EventHandler };
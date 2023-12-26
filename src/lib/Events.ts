import type Message from "./Message";

enum Events {
    Ready = "READY",
    MessageCreate = "MESSAGE_CREATE",
    RelationshipAdd = "RELATIONSHIP_ADD",
    Captcha = "CAPTCHA",
};

interface EventParams {
    [Events.Ready]: void;
    [Events.MessageCreate]: Message;
    [Events.RelationshipAdd]: any;
    [Events.Captcha]: [string, (response: string) => Promise<void>];
};

type EventHandler<T extends keyof EventParams> = (params: EventParams[T]) => void;

export default Events;
export type { EventParams, EventHandler };
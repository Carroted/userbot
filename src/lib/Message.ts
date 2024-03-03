import type APIMessage from "./APIMessage.ts";
import Channel from "./Channel.ts";

export default interface Message extends APIMessage {
    channel: Channel
}
export default interface APIChannel {
    flags: number;
    id: string;
    last_message_id?: string;
    last_pin_timestamp?: string;
    name: string;
    nsfw: boolean;
    parent_id: string | null;
    permission_overwrites: {
        allow: string;
        deny: string;
        id: string;
        type: number;
    }[];
    position: number;
    rate_limit_per_user?: number;
    status?: any | null;
    theme_color?: number | null;
    topic?: string;
    type: number;
}
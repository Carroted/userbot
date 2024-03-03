export default interface APIUser {
    accent_color?: any | null; // missing if not fetched
    avatar: string | null;
    avatar_decoration: any | null;
    banner?: any | null;
    banner_color?: any | null;
    discriminator: string;
    display_name?: string | null;
    flags?: number;
    global_name: string | null;
    id: string;
    public_flags: number;
    username: string;
}
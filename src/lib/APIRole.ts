export default interface APIRole {
    color: number;
    description?: null; // why the F is this here, why did discord add this invisible null property wtf
    flags: number;
    hoist?: boolean;
    icon: any | null;
    id: string;
    managed: boolean;
    mentionable: boolean;
    name: string;
    permissions: string;
    position: number;
    unicode_emoji?: string | null;
    version?: number;
    // theres loads more, like tags (for server boost/twitch etc) but literally who cares, why would we need that rn
}
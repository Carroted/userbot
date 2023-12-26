import APIChannel from "./APIChannel";

export default interface APIGuild {
    channels: APIChannel[];
    emojis: any[];
    guild_scheduled_events?: any[];
    id: string;
    joined_at: string;
    large: boolean;
    lazy?: boolean;
    member_count: number;
    premium_subscription_count: number;
    properties: {
        explicit_content_filter: number;
        premium_progress_bar_enabled: boolean;
        max_video_channel_users: number;
        icon: string | null;
        features: any[];
        splash: any | null;
        verification_level: number;
        default_message_notifications: number;
        system_channel_flags: number;
        afk_channel_id: string | null;
        home_header: any | null;
        safety_alerts_channel_id: string | null;
        id: string;
        discovery_splash: any | null;
        description: string | null;
        max_members: number;
        vanity_url_code: string | null;
        premium_tier: number;
        preferred_locale: string;
        afk_timeout: number;
        public_updates_channel_id: string | null;
        application_id: string | null;
        mfa_level: number;
        owner_id: string;
        max_stage_video_channel_users: number;
        hub_type: any | null,
        nsfw: boolean;
        banner: any | null;
        rules_channel_id: string | null;
        nsfw_level: number;
        latest_onboarding_question_id: string | null;
        incidents_data: any | null;
        name: string;
        inventory_settings: any | null;
        system_channel_id: string | null;
    };
    roles: {
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
        tags?: any;
        unicode_emoji?: any;
    }[];
    stage_instances?: any[];
    stickers?: any[];
    threads?: any[];
    version: string;
}

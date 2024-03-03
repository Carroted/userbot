import TrackingEvent from "../TrackingEvent";

// extend it with ChannelOpened
export default interface ChannelOpened extends TrackingEvent {
    type: "channel_opened";
    properties: {
        client_send_timestamp: number;
        client_track_timestamp: number;
        client_uuid: string;
        accessibility_features: number;
        accessibility_support_enabled: boolean;
        can_send_message: boolean;
        channel_hidden: boolean;
        channel_id: string;
        channel_is_nsfw: boolean;
        channel_member_perms: string;
        channel_size_total: number;
        channel_type: number;
        client_heartbeat_session_id: string;
        has_pending_member_action: boolean;
        rendered_locale: string;
    }
};
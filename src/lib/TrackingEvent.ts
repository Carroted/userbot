export default interface TrackingEvent {
    type: "channel_opened" | "guild_onboarding_loaded" | "member_list_viewed" | "ack_messages" | "dm_list_viewed" | "af_loaded" | "af_exited" | "open_popout";
    properties: {
        // only these 3 properties are consistent:
        client_send_timestamp: number;
        client_track_timestamp: number;
        client_uuid: string;
        // the rest are different for each event type
    }
}
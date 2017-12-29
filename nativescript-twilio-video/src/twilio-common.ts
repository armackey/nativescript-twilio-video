export interface VideoActivityBase {
    startPreview(): void;
    toggle_local_video(): void;
    toggle_local_audio(): void;
    connect_to_room(roomName: string): void;
    set_access_token(token: string, name: string): void;
    disconnect(): void;
    // addParticipant(participant: any): void;
    // addParticipantVideo(videoTrack: any): void;
}

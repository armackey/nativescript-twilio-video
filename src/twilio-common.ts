export interface VideoActivityBase {
    start_preview(): void;
    toggle_local_video(): void;
    toggle_local_audio(): void;
	connect_to_room(roomName: string, options: {video: boolean, audio: boolean}): void;
	set_access_token(token: string): void;
    disconnect(): void;
    // addParticipant(participant: any): void;
    // addParticipantVideo(videoTrack: any): void;
}

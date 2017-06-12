export interface VideoActivityBase {
    createAudioAndVideoTracks(): void;
    toggle_local_video(): void;
    toggle_local_audio(): void;
    destroy_local_video(): void;
    destroy_local_audio(): void;
    connect_to_room(roomName: string): void;
    set_access_token(token: string, name: string): void;
    disconnect_from_room(): void;
    roomListener(): any;
    participantListener(): any;
    addParticipant(participant: any): void;
    addParticipantVideo(videoTrack: any): void;
    removeParticipantVideo(videoTrack: any): void;
    removeParticipant(participant: any): void;
    configureAudio(enable: boolean): void;
}

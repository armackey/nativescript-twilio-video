
export interface VideoActivityBase {

    createAudioAndVideoTracks(): void;
    
    toggle_local_video(): void;

    toggle_local_audio(): any;

    destroy_local_video(): void;

    configure_audio(enable: boolean): void;

    // destroy_local_audio(): void;

   /* 
    *    @param { string } roomName
    */
    
    connect_to_room(roomName: string): void;

   /* 
    *    @param { string } token
    */

    set_access_token(token: string): void;

    removeParticipantVideo(videoTrack: any): void;

    removeParticipant(participant: any): void;

    // configureAudio(enable: boolean): void;






}
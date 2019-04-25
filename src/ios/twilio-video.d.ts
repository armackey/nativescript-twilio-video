import { Observable } from 'tns-core-modules/data/observable';
import { VideoActivityBase } from "../twilio-common";
export declare class VideoActivity implements VideoActivityBase {
    localVideoView: any;
    remoteVideoView: any;
    localVideoTrack: any;
    localAudioTrack: any;
    cameraCapturer: any;
    accessToken: string;
    roomObj: any;
    previousMicrophoneMute: boolean;
    localParticipant: any;
    remoteParticipant: any;
    private _cameraCapturerDelegate;
    private _roomListener;
    private _participantDelegate;
    private _roomDelegate;
    private camera;
    room: any;
    constructor();
    start_preview(): void;
    disconnect(): void;
    toggle_local_video(): void;
    toggle_local_audio(): void;
    connect_to_room(room: string, options: {
        video: boolean;
        audio: boolean;
    }): void;
    cleanupRemoteParticipant(): void;
    notify(reason: string): void;
    connectToRoomWithListener(room: any): void;
    participant_joined_room(participant: any): void;
    set_access_token(token: string): void;
    remove_remote_view(videoTrack: any, participant: any): void;
    add_video_track(videoTrack: any): void;
    destroy_local_video(): void;
    configure_audio(enable: boolean): any;
    readonly event: Observable;
}

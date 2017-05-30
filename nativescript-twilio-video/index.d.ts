import { View } from 'ui/core/view';
export declare class VideoActivity extends View {
    previousAudioMode: any;
    localVideoView: any;
    primaryVideoView: any;
    localVideoTrack: any;
    localAudioTrack: any;
    cameraCapturer: any;
    accessToken: string;
    TWILIO_ACCESS_TOKEN: string;
    room: string;
    participantIdentity: string;
    localParticipant: any;
    audioManager: any;
    constructor();
    readonly android: any;
    createNativeView(): any;
    createAudioAndVideoTracks(localVideo: any): any;
}

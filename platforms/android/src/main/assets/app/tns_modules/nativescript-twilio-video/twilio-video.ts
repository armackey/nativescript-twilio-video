import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";

declare var com, android: any;;

const AudioManager = android.media.AudioManager;
const LocalParticipant = com.twilio.video.LocalParticipant;
const RoomState = com.twilio.video.RoomState;
const Video = com.twilio.video.Video;
const VideoRenderer = com.twilio.video.VideoRenderer;
const TwilioException = com.twilio.video.TwilioException;
// const quickstart.R = com.twilio.video.quickstart.R;
// const quickstart.dialog.Dialog = com.twilio.video.quickstart.dialog.Dialog;
const AudioTrack = com.twilio.video.AudioTrack;
const CameraCapturer = com.twilio.video.CameraCapturer;
// const CameraCapturer.CameraSource = com.twilio.video.CameraCapturer.CameraSource;
const ConnectOptions = com.twilio.video.ConnectOptions;
const LocalAudioTrack = com.twilio.video.LocalAudioTrack;
const LocalVideoTrack = com.twilio.video.LocalVideoTrack;
const Participant = com.twilio.video.Participant;
const Room = com.twilio.video.Room;
const VideoTrack = com.twilio.video.VideoTrack;
const VideoView: any = com.twilio.video.VideoView;

export class VideoActivity extends View {

    public previousAudioMode: any;
    public localVideoView: any;
    public primaryVideoView: any;

    public localVideoTrack: any;
    public localAudioTrack: any;
    public cameraCapturer: any;
    public accessToken: string;
    public TWILIO_ACCESS_TOKEN: string;
    public room: string;
    public participantIdentity: string;
    public localParticipant: any;
    public audioManager: any; 
    
    

    constructor() {
        super();
    }

    public get android() {

        return this.nativeView;

    }

    public createNativeView() {

        return new VideoView(this._context);

    }   

    public createAudioAndVideoTracks(localVideo: any): any {
        return this;        
        // this.primaryVideoView = this.nativeView;

        // // Share your microphone
        // this.localAudioTrack = LocalAudioTrack.create(utils.ad.getApplicationContext(), true);

        // // Share your camera

        // this.cameraCapturer = new CameraCapturer(utils.ad.getApplicationContext(), CameraCapturer.CameraSource.FRONT_CAMERA);
        // this.localVideoTrack = LocalVideoTrack.create(utils.ad.getApplicationContext(), true, this.cameraCapturer);
    

        // this.primaryVideoView.setMirror(true);
        // this.localVideoTrack.addRenderer(this.primaryVideoView);
        // this.localVideoView = this.primaryVideoView;

    }    


    
}
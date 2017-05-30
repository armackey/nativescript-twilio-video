import { View } from 'ui/core/view';

declare var com;

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

    constructor() {
        super();
    }

    public get android() {

        return this.nativeView;

    }

    public createNativeView() {

        return new VideoView(this._context, null);

    }   

    
    
}
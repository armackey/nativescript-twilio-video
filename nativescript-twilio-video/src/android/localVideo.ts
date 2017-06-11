import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";

var app = require("application");

declare var com, android: any;

const CameraCapturer = com.twilio.video.CameraCapturer;
const LocalParticipant = com.twilio.video.LocalParticipant;
const LocalAudioTrack = com.twilio.video.LocalAudioTrack;
const LocalVideoTrack = com.twilio.video.LocalVideoTrack;

const VideoView: any = com.twilio.video.VideoView;
const videoView = new VideoView(utils.ad.getApplicationContext());

export class LocalVideo extends View {

    private localVideoView: any = videoView;

    constructor() {
        super();
    }

    get android(): any {

        return this.nativeView;

    }

    public createNativeView() {

        return new android.widget.LinearLayout(utils.ad.getApplicationContext());

    }


    public initNativeView(): void {

        this.nativeView.addView( videoView );

    }

    public get_local_view(): any {

        return this.localVideoView;

    }


}
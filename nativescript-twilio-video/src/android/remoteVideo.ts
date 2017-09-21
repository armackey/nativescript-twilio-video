import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";

declare var com, android: any;
// const VideoView: any = com.twilio.video.VideoView;
// const videoView = new VideoView(utils.ad.getApplicationContext());

export class RemoteVideo extends View {

    remoteVideoView: any;

    constructor() {
        super();

        this.remoteVideoView = new com.twilio.video.VideoView(utils.ad.getApplicationContext());
    }

    get android(): any {

        return this.nativeView;

    }

    public createNativeView() {

        return this.remoteVideoView;
        // return new android.widget.LinearLayout(utils.ad.getApplicationContext());

    }


    public initNativeView(): void {

        // this.nativeView.addView(this.remoteVideoView);

    }

    public disposeNativeView() {

        this.nativeView = null;

    }

    // public removeVideoView() {

    //     this.nativeView.removeView(this.remoteVideoView);

    // }


}
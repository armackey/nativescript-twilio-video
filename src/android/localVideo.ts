import { View } from 'tns-core-modules/ui/core/view';
import * as utils from "tns-core-modules/utils/utils";

// var app = require("application");

declare var com, android: any;

// const VideoView: any = com.twilio.video.VideoView;
// const videoView = new VideoView(utils.ad.getApplicationContext());

export class LocalVideo extends View {

    localVideoView: any;

    constructor() {
        super();
        this.localVideoView = new com.twilio.video.VideoView(utils.ad.getApplicationContext());
    }

    get android(): any {

        return this.nativeView;

    }

    public createNativeView() {

        // return new android.widget.LinearLayout(utils.ad.getApplicationContext());
        return this.localVideoView;

    }


    // public initNativeView(): void {

    //     // this.nativeView.addView(this.localVideoView);

    // }

    public disposeNativeView() {

        this.nativeView = null;

    }

    // public removeVideoView() {

    //     this.nativeView.removeView(this.localVideoView);

    // }




}
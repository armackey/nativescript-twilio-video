import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";

declare var com, android: any;
const VideoView: any = com.twilio.video.VideoView;
const videoView = new VideoView(utils.ad.getApplicationContext());

export class RemoteVideo extends View {

    private remoteVideoView: any = videoView;

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

        this.nativeView.addView(videoView);

    }  



    public get_remote_view(): any {
        return this.remoteVideoView;
    }


}
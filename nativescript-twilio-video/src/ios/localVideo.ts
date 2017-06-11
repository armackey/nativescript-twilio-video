import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";


var app = require("application");

declare var com, UIView;


// const VideoView: any = TVICameraCapturer
const videoView: any = TVICameraCapturer()

export class LocalVideo extends View {
    
    nativeView: UIView;
    private localVideoView: any = videoView;

    constructor() {
        super();
    }

    get ios(): any {

        return this.nativeView;

    }

    public createNativeView() {
        
        return UIView.new(); 

    }


    public initNativeView(): void {

        this.nativeView.addView(videoView);

    }

    public get_local_view(): any {

        return this.localVideoView;

    }


}
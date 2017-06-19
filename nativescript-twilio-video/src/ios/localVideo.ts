import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";

declare var TVIVideoViewRenderer, TVICameraPreviewView, UIViewContentModeScaleAspectFit;

let rect = {
    origin: {
        x: 0,
        y: 0
    },
    size: {
        width: 0,
        height: 0
    }
};


const videoView = TVIVideoViewRenderer.alloc().init().view;

export class LocalVideo extends View {
    
    public localVideoView: any;

    constructor() {
        super();
        
        this.localVideoView = videoView;
        // console.log(videoView);
    }

  
    get ios(): any {

        return this.nativeView;

    }

    public createNativeView() {
        
        return UIView.new(); 

    }


    public initNativeView(): void {

        // this.nativeView.contentMode = UIViewContentModeScaleAspectFit;

        this.nativeView.addSubview( videoView );

    }

    // public disposeNativeView() {
        
    //     this.nativeView = null;

    // }  

}
import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";


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


export class LocalVideo extends View {
    
    public localVideoView: any;

    constructor() {
        super();
        // this.localVideoView = TVIVideoView.init(CGRectMake(0, 0, 0, 0));
        // console.log(videoView);
    }

  
    get ios(): any {

        return this.nativeView;

    }

    public createNativeView() {
        
        return UIView.new(); 

    }


    // public initNativeView(): void {

    //     this.nativeView.addSubview( this.localVideoView );

    // }

    // public disposeNativeView() {
        
    //     this.nativeView = null;

    // }  

}
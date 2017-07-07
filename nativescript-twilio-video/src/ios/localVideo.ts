import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";
import { Observable, fromObject } from 'tns-core-modules/data/observable';

import { VideoViewDelegate } from './delegates';

declare var TVIVideoView, CGRectMake;
// const videoView = TVIVideoView.alloc().init();

export class LocalVideo extends View {

    public localVideoView: any;
    public _videoViewDelegate: any; 
    nativeView: UIView;

    constructor() {
        super();

        this._videoViewDelegate = VideoViewDelegate.initWithOwner(new WeakRef(this));
        this.localVideoView = TVIVideoView.alloc().initWithFrameDelegate(CGRectMake(0, 0, 0, 0), this._videoViewDelegate);    

    }

    public createNativeView(): any {
        
        return UIView.new(); 

    }


    public initNativeView(): void {  

        this.nativeView.addSubview( this.localVideoView );

    }

    public disposeNativeView(): void {
        
        this.nativeView = null;

    }

    get events(): Observable {
        
        return this._videoViewDelegate.events;

    }

    get ios(): any {

        return this.nativeView;

    }      

    // public onLoaded() {
    //     // console.log(`onLoaded ${this.width}, ${this.height}`);
    //     if (this.width) {
    //         this.nativeView.frame.size.width = this.width;
    //     }
    //     if (this.height) {
    //         this.nativeView.frame.size.height = this.height;
    //     }
    // }

}

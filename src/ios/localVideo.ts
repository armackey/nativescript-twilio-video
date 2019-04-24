import { View } from 'tns-core-modules/ui/core/view';
import * as utils from "tns-core-modules/utils/utils";
import { Observable, fromObject } from 'tns-core-modules/data/observable';

import { VideoViewDelegate } from './delegates';

declare var TVIVideoView;

// const videoView = TVIVideoView.alloc().init();

export class LocalVideo extends View {

    localVideoView: any;
    _videoViewDelegate: any; 
    nativeView: any;
    
    constructor() {
        super();
        // try {
        //     this._videoViewDelegate = VideoViewDelegate.initWithOwner(new WeakRef(this));
        //     this.localVideoView = TVIVideoView.alloc().init().initWithFrame(this._videoViewDelegate);
        // } catch(e) {
        //     console.log(e);
        // }
        this.localVideoView = TVIVideoView.alloc().init();
        this.localVideoView.mirror = true;
        this.localVideoView.contentMode = UIViewContentMode.ScaleAspectFill;
    }

    public createNativeView(): any {
        
        return this.localVideoView;

    }

    public disposeNativeView(): void {
        
        this.nativeView = null;

    }

}

import { View } from 'tns-core-modules/ui/core/view';
import * as utils from "tns-core-modules/utils/utils";
import { Observable, fromObject } from 'tns-core-modules/data/observable';

// import { VideoViewDelegate } from './delegates';

declare var TVIVideoView, CGRectMake;


export class RemoteVideo extends View {

    remoteVideoView: any;
    _remoteViewDelegate: any;
    nativeView: UIView;

    constructor() {
        super();
        
        // this._remoteViewDelegate = VideoViewDelegate.initWithOwner(new WeakRef(this));
        this.remoteVideoView = TVIVideoView.alloc().init(); 
        this.remoteVideoView.mirror = true;   
        this.remoteVideoView.contentMode = UIViewContentMode.ScaleAspectFill;
    }

    public createNativeView() {

        return this.remoteVideoView;

    }    

    public disposeNativeView(): void {

        this.nativeView = null;

    }


    get ios(): any {

        return this.nativeView;

    }  

}
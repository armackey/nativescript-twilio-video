import { View } from 'tns-core-modules/ui/core/view';
export declare class LocalVideo extends View {
    localVideoView: any;
    _videoViewDelegate: any;
    nativeView: any;
    constructor();
    createNativeView(): any;
    disposeNativeView(): void;
}

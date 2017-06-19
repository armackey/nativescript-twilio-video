import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";



export class RemoteVideo extends View {

    public localVideoView: any;

    constructor() {
        super();
    }


    get ios(): any {

        return this.nativeView;

    }

    public createNativeView() {

        return UIView.new();

    }

}
import {Observable} from 'data/observable';
import { VideoActivity } from 'nativescript-twilio-video';
import { Page } from 'ui/page';
import * as app from "tns-core-modules/application";

var permissions = require('nativescript-permissions');

export class HelloWorldModel extends Observable {

    private _counter: number;
    private _message: string;
    private localVideo: any;
    // private self: any;
    constructor(private page: Page) {
        super();

        // let videoActivity = new VideoActivity();
        // this.localVideo = this.page.getViewById('local-video');


        // videoActivity.createAudioAndVideoTracks(this.localVideo); 
        // this.renderView();

        this.getPermissions();


    }

    renderView(): void {
        console.log('renderView called');
        let videoActivity = new VideoActivity();
        this.localVideo = this.page.getViewById('local-video');
        videoActivity.createAudioAndVideoTracks(this.localVideo); 
    }

    getPermissions(): void {
        
        const self = this;

        permissions.requestPermissions(
            [android.Manifest.permission.RECORD_AUDIO,
            android.Manifest.permission.CAMERA], "I need these permissions because I'm cool")
            .then(function () {

                console.log("Woo Hoo, I have the power!");

                self.renderView();
                // console.log(self.renderView());
                

            })
            .catch(function (e) {
                console.dir(e);
                console.log("Uh oh, no permissions - plan B time!");
            });
    }

    get message(): string {
        return this._message;
    }
    
    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            this.notifyPropertyChange('message', value)
        }
    }

    public onTap() {
        this._counter--;
        this.updateMessage();
    }

    private updateMessage() {
        if (this._counter <= 0) {
            this.message = 'Hoorraaay! You unlocked the NativeScript clicker achievement!';
        } else {
            this.message = `${this._counter} taps left`;
        }
    }
}
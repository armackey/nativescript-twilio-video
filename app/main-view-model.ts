import {Observable} from 'data/observable';
import { Page } from 'ui/page';
import * as app from "tns-core-modules/application";
var http = require("http");

import { LocalVideo, RemoteVideo, VideoActivity } from 'nativescript-twilio-video';



var timer = require("timer");
var permissions = require('nativescript-permissions');




export class HelloWorldModel extends Observable {
    videoActivity: VideoActivity;
    // game mode read my lips
    private localVideo: any;
    private accessToken: string;
    private roomName: string;
    public name: string;
    private heros: any;

    constructor(private page: Page) {
        super();
        this.videoActivity = new VideoActivity();
        this.getPermissions();
        // console.dir(this);
        console.dir(this.videoActivity);
        this.on('onConnected', (data) => {
            console.log('working');
            console.log(data);
        })
        // this.videoActivity.videoEvent.on('onConnected', (data) => {
        //     console.log(data);
        // })
    }



    getPermissions(): void {

        permissions.requestPermissions([
            android.Manifest.permission.RECORD_AUDIO,
            android.Manifest.permission.CAMERA
            ], "I need these permissions because I'm cool")
            .then((response) => {
            })
            .catch((e) => {
                console.dir(e);
                console.log("Uh oh, no permissions - plan B time!");
            });
    }


    public show_local_video() {

        this.videoActivity.createAudioAndVideoTracks();

    }

    public toggle_local_video() {

        this.videoActivity.toggle_local_video();

    }

    public set_access_token(token: string, name: string) {

        this.videoActivity.set_access_token(token, name);

    }


    public connect_to_room(room: string): void {
        
        http.getJSON('http://ac865ff2.ngrok.io/token').then((res) => {
            
            
            this.set('name', res.identity);
            this.set_access_token(res.token, res.identity);
            this.videoActivity.connect_to_room('change3');
            console.log('hit');
        }, (e) => {
            console.log(e);
        });
        
    }


}
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LocalVideo, VideoActivity, RemoteVideo } from 'nativescript-twilio-video';
const permissions = require('nativescript-permissions');
const http = require("tns-core-modules/http");

@Component({
    selector: 'ns-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    moduleId: module.id,
})
export class HomeComponent implements OnInit {
    @ViewChild('localvideo') localvideo: ElementRef;
    @ViewChild('remotevideo') remotevideo: ElementRef;
    va: VideoActivity;
    name: string;
    room: string;
    constructor() { }

    ngOnInit() {

        this.va = new VideoActivity();


        this.va.localVideoView = this.localvideo.nativeElement.localVideoView;
        this.va.remoteVideoView = this.remotevideo.nativeElement.remoteVideoView;

        permissions.requestPermissions([
            "android.permission.RECORD_AUDIO",
            "android.permission.CAMERA"
        ], "I need these permissions because I'm cool")
            .then((response) => {
                console.dir(response);
            })
            .catch((e) => {
                console.dir(e);
                console.log("Uh oh, no permissions - plan B time!");
            });
    }

    startLocalVideo(): void {

        this.va.start_preview();

    }

    public connect_to_room(): void {
        this.get_token()
            .then(result => {
                var result = result.content.toJSON();
                console.log(result);
                this.va.set_access_token(result['twilioToken']);
                this.va.connect_to_room(this.room, { video: true, audio: true });
                console.log(this.va.room);
            }, e => {
                console.log(e);
            });
    }

    public disconnect(): void {

        this.va.disconnect();

    }

    private get_token(): Promise<any> {
        let name = this.name;
        console.log('name:', name);
        return http.request({
            url: 'https://9e828d6e.ngrok.io/twilioToken',
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({ uid: name })
        });
    }

}

import { Observable, fromObject } from 'data/observable';
import { Page } from 'ui/page';
import * as app from "tns-core-modules/application";
import { View } from "ui/core/view"
var http = require("http");

import { LocalVideo, VideoActivity, RemoteVideo} from 'nativescript-twilio-video';




var timer = require("timer");
var permissions = require('nativescript-permissions');
var participant;
var _pdelegate;
var rdelegate;
/**
 * create disconnect button test
 * create toggle audio/video test
 * fix VideoActivityBase
 * 
 */




export class HelloWorldModel extends Observable {
    room: any;
    videoActivity: VideoActivity;
    // game mode read my lips
    private localVideo: any;
    private accessToken: string;
    private roomName: string;
    public name: string;
    private heros: any;
    public participant: any;
    public countdown: number = 60;
    public roomButton: any;
    localVideoView: any;


    constructor(private page: Page) {
        super();

        let localVideo = <LocalVideo>this.page.getViewById('local-video');

        let remoteVideo = <RemoteVideo>this.page.getViewById('remote-video');

        this.videoActivity = new VideoActivity();
        
        this.videoActivity.localVideoView = localVideo.localVideoView;
        
        this.videoActivity.remoteVideoView = remoteVideo.remoteVideoView;

        this.getPermissions();

        this.videoActivity.events.on('onConnected', (data) => {

            let room = data.object['room'];

            console.log(room);
            
            this.videoActivity.set_listener_for_participants(room);

        });  

        this.videoActivity.events.on('onParticipantConnected', (data) => {

            console.log('onParticipantConnected');

            let participant = data.object['participant'];

            let room = data.object['room'];

            this.videoActivity.participant_joined_room(participant);

            // this.participant = data.object['participant'].getIdentity();

            // this.set('participant', data.object['participant'].getIdentity());

        });   

        this.videoActivity.events.on('onVideoTrackAdded', (data) => {

            /**
             *  add video track here
             */

            console.log('onVideoTrackAdded');

            let videoTrack = data.object['videoTrack'];

            let participant = data.object['participant'];

            this.videoActivity.add_video_track(videoTrack);


        });              

        this.videoActivity.events.on('onDisconnected', (data) => {

            let room = data.object['room'];

            let error = data.object['error'];

            console.log(error);

            this.videoActivity.configure_audio(false);

            console.log('onDisconnected');

        }); 

 

        this.videoActivity.events.on('onConnectFailure', (data) => {
            // leave room.. request new match
            console.log('onConnectFailure');

            this.videoActivity.configure_audio(false);

        });

 
        this.videoActivity.events.on('onParticipantDisconnected', (data) => {
            
            console.log('onParticipantDisconnected');

            /**
             * leave room.. request new match
             */

            let participant = data.object['participant'];
            

            this.videoActivity.removeParticipant(participant);            
            

            // this.participant = data.object['participant'].getIdentity();

        }); 

        this.videoActivity.events.on('onAudioTrackAdded', (data) => {

            console.log('onAudioTrackAdded');

        }); 

        this.videoActivity.events.on('onAudioTrackRemoved', (data) => {

            console.log('onAudioTrackRemoved');

        }); 

        this.videoActivity.events.on('onVideoTrackRemoved', (data) => {
            console.log('onVideoTrackRemoved');
        });  

        this.videoActivity.events.on('onAudioTrackEnabled', (data) => {
            console.log('onAudioTrackEnabled');
        });  

        this.videoActivity.events.on('onAudioTrackDisabled', (data) => {
            console.log('onAudioTrackDisabled');
        }); 

        this.videoActivity.events.on('onVideoTrackEnabled', (data) => {
            console.log('onVideoTrackEnabled');
        });  

        this.videoActivity.events.on('onVideoTrackDisabled', (data) => {
            console.log('onVideoTrackDisabled');
        });          

    }



    getPermissions(): void {

        if (app.android) {

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


    }


    public disconnect() {

        this.videoActivity.roomObj.disconnect();

    }



    public add_time() {
        // console.dir(TVICameraCapturer.alloc().init().initWithFrameDelegate());
    }


    public show_local_video() {

        this.videoActivity.createAudioAndVideoTracks();

    }

    public toggle_local_audio() {

        this.videoActivity.toggle_local_audio();

    }


    public toggle_local_video() {

        this.videoActivity.toggle_local_video();

    }

    public connect_to_room(room: string): void {       
        
        http.getJSON('https://88648a24.ngrok.io/token').then((res) => {

            this.videoActivity.set_access_token(res.token);

            this.videoActivity.connect_to_room('a31');

        }, (e) => {

            console.log(e);

        });

    }

}
import {Observable} from 'data/observable';
import { Page } from 'ui/page';
import * as app from "tns-core-modules/application";
var http = require("http");

import { VideoActivity } from 'nativescript-twilio-video';



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
    public participant: any;

    constructor(private page: Page) {
        super();
        this.videoActivity = new VideoActivity();
        this.getPermissions();
        this.set('participant', 'wow');
        let self = this;

        // this.videoActivity.videoEvent.on('onConnected', (data) => {
        //     let participants = data.object['room'].getParticipants();
        //     let string = data.object.string;
        //     console.log(string);
        //     this.set('participant', string);
        //     for (var i = 0, l = participants.size(); i < l; i++) {

        //         var participant = participants.get(i);
        //         this.participant = participant.getIdentity();
        //         console.log(this.participant, ' is a ', typeof this.participant);
        //         this.set('participant', String(participant.getIdentity()));

        //     }
            
            
        //     // console.log(data.object['room'].getName()); // room name
        // })  
        // this.videoActivity.videoEvent.on('onConnectFailure', (data) => {
        //     // leave room.. request new match
        //     console.log('onConnectFailure');
        //     console.dir(data);
        // }) 
        // this.videoActivity.videoEvent.on('onDisconnected', (data) => {
        //     // leave room.. request new match
        //     console.log('onDisconnected');
            
        //     this.participant = data.object['participant'].getIdentity();
        //     console.log('onDisconnected: ', this.participant);
        // }) 
        // this.videoActivity.videoEvent.on('onParticipantConnected', (data) => {
        //     console.log('onParticipantConnected');
        //     this.participant = data.object['participant'].getIdentity();
        //     this.set('participant', data.object['participant'].getIdentity());
        // }) 
        // this.videoActivity.videoEvent.on('onParticipantDisconnected', (data) => {
        //     // leave room.. request new match
        //     console.log('onParticipantDisconnected');
        //     this.participant = data.object['participant'].getIdentity();
        // }) 
        // this.videoActivity.videoEvent.on('onAudioTrackAdded', (data) => {
        //     console.log('onAudioTrackAdded');
        // }) 
        // this.videoActivity.videoEvent.on('onAudioTrackRemoved', (data) => {
        //     console.log('onAudioTrackRemoved');
        // }) 
        // this.videoActivity.videoEvent.on('onVideoTrackAdded', (data) => {
        //     console.log('onVideoTrackAdded');
        // }) 
        // this.videoActivity.videoEvent.on('onVideoTrackRemoved', (data) => {
        //     console.log('onVideoTrackRemoved');
        // })  
        // this.videoActivity.videoEvent.on('onAudioTrackEnabled', (data) => {
        //     console.log('onAudioTrackEnabled');
        // })  
        // this.videoActivity.videoEvent.on('onAudioTrackDisabled', (data) => {
        //     console.log('onAudioTrackDisabled');
        // }) 
        // this.videoActivity.videoEvent.on('onVideoTrackEnabled', (data) => {
        //     console.log('onVideoTrackEnabled');
        // })  
        // this.videoActivity.videoEvent.on('onVideoTrackDisabled', (data) => {
        //     console.log('onVideoTrackDisabled');
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
        this.videoActivity.connect_to_room('a');        
        // http.getJSON('http://ac865ff2.ngrok.io/token').then((res) => {
        //     this.set('name', res.identity);
        //     this.set_access_token(res.token, res.identity);
        //     this.videoActivity.connect_to_room('aassbcdaefghaijssklm');
        //     console.log('hit');          
        // }, (e) => {
        //     console.log(e);
        // });
        
    }


}
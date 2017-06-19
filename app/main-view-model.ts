import {Observable} from 'data/observable';
import { Page } from 'ui/page';
import * as app from "tns-core-modules/application";
var http = require("http");

import { LocalVideo, VideoActivity } from 'nativescript-twilio-video';



var timer = require("timer");
var permissions = require('nativescript-permissions');

interface TVIRoomDelegate extends NSObjectProtocol {
    didConnectToRoom?(room: any): void;
    didFailToConnectWithError?(room: any, error: Error): void;
    didDisconnectWithError?(room: any, error: Error): void;
    participantDidConnect?(room, participant): void;
    participantDidDisconnect?(room, participant): void;
    roomDidStartRecording?(room): void;
    roomDidStopRecording?(room): void;
}

class RoomDelegate extends NSObject implements TVIRoomDelegate {
    
    static ObjCProtocols = [ TVIRoomDelegate ]; // define our native protocalls

    static new(): TVIRoomDelegate {
        return <TVIRoomDelegate>super.new() // calls new() on the NSObject
    }

    didConnectToRoom(room) {
        console.log('connected to a room');
        console.log(room);
    }
    didFailToConnectWithError(room, error) {

        console.log('didFailToConnectWithError');
        console.log(room);
    }
    didDisconnectWithError(room, error) {
        console.log('didDisconnectWithError')
        console.log(error);
        console.log(room);
    };
    participantDidConnect(room, participant) {
        console.log('participantDidConnect');
        console.log(room);
    }
    participantDidDisconnect(room, participant) {
        console.log('participantDidDisconnect');
        console.log(room);
    }    
    roomDidStartRecording(room) {
        console.log('roomDidStartRecording')
    }
    roomDidStopRecording(room) {
        console.log('roomDidStopRecording')
    }
}   




export class HelloWorldModel extends Observable {
    room: any;
    videoActivity: VideoActivity;
    // game mode read my lips
    
    
    token: string = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzNjMmE5OTI1Yjg4NTUwODg1ZDhjZDJmNzMwYWNlMTZmLTE0OTc4MzE2ODkiLCJpc3MiOiJTSzNjMmE5OTI1Yjg4NTUwODg1ZDhjZDJmNzMwYWNlMTZmIiwic3ViIjoiQUM5NjFhZjMzYmUyZDI2OWIzZTM2NThiNjJlNWU1ZDU1OCIsImV4cCI6MTQ5NzgzNTI4OSwiZ3JhbnRzIjp7ImlkZW50aXR5IjoidyIsInZpZGVvIjp7InJvb20iOiJlIn19fQ.0PjYE2Dt3-3VlRi-EErMsmG44ACr313j4603O8X5AjU'
    private localVideo: any;
    private accessToken: string;
    private roomName: string;
    public name: string;
    private heros: any;
    public participant: any;
    public countdown: number = 60;
    public roomButton: any;


    constructor(private page: Page) {
        super();
        let delegate = <RoomDelegate>RoomDelegate.new()

        // let room: TVIRoom = TVIRoom.new()
        // tess.delegate = delegate
        
        
        // let tess: G8Tesseract = G8Tesseract.new()
        // tess.delegate = delegate

            // console.log(Object.keys(TVIRoomDelegate));
        
        var connectOptions = TVIConnectOptions.optionsWithBlock( (builder) => {
            
            // builder.localMedia = null;
            builder.name = 'crazy';
            
            return builder;

        });

        // console.dir(connectOptions);
        



        var videoClient = TVIVideoClient.clientWithToken(this.token);
        this.room = videoClient.connectWithOptionsDelegate(connectOptions, delegate);
        

        console.dir(this.room)




        




        var self = this;


        this.videoActivity = new VideoActivity();
        // this.getPermissions();
        // this.set('participant', 'wow');
        // let self = this;

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

 
    public disconnect() {
        console.log('clicked');
        console.log(this.room);
        this.room.disconnect();
    }



    public add_time() {
        console.dir(this.room)
    }


    public show_local_video() {
        // this.videoActivity.createAudioAndVideoTracks();

    }

    // public toggle_local_video() {

    //     this.videoActivity.toggle_local_video();

    // }

    public set_access_token(token: string, name: string) {

        

    }



    public connect_to_room(room: string): void {
        console.dir(this.room)
        // console.log(this.videoActivity);
        // this.videoActivity.set_access_token('wow', 'wow');
        // this.videoActivity.connect_to_room('aadfsd');        
        
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
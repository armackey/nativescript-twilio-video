import { Observable, fromObject } from 'data/observable';
import { Page } from 'ui/page';
import * as app from "tns-core-modules/application";
import { View } from "ui/core/view"
import { LocalVideo, VideoActivity, RemoteVideo} from 'nativescript-twilio-video';

var http = require("http");
var permissions = require('nativescript-permissions');



export class HelloWorldModel extends Observable {
    
    private localVideo: LocalVideo;
    private remoteVideo: RemoteVideo;
    private accessToken: string;
    private roomName: string;
    public name: string;
    private heros: any;
    public participant: any;
    public countdown: number = 60;
    public roomButton: any;
    localVideoView: any;
    videoActivity: VideoActivity;

    constructor(private page: Page) {
        super();

        this.localVideo = <LocalVideo>this.page.getViewById('local-video');

        this.remoteVideo = <RemoteVideo>this.page.getViewById('remote-video');

        this.videoActivity = new VideoActivity();
        
        this.videoActivity.localVideoView = this.localVideo.localVideoView;
        
        this.videoActivity.remoteVideoView = this.remoteVideo.remoteVideoView;

        this.videoActivity.createAudioAndVideoTracks()
        


        this.getPermissions()
        this.getToken()                
            .then((result) => {
                console.log('result');
                var result = result.content.toJSON();
                // console.dir(result.content);
                console.log(result['token']);

                this.videoActivity.set_access_token(result['token']);
                
            })
                



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
            console.log(JSON.stringify(data));

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



    getPermissions(): Promise<any> {

        return new Promise((resolve, reject) => {

            if (app.android) {

                permissions.requestPermissions([
                    "android.permission.RECORD_AUDIO",
                    "android.permission.CAMERA"
                ], "I need these permissions because I'm cool")
                    .then((response) => {
                        console.dir(response);
                        resolve();
                    })
                    .catch((e) => {
                        console.dir(e);
                        console.log("Uh oh, no permissions - plan B time!");
                    });

            } else {
                resolve();
            }

            
        })


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

    public connect_to_room(): void {    
           

        this.videoActivity.connect_to_room('abc');

    }




    public getToken(): any {
        let user = {
            name: ''
        };

        if (app.android) {
            user.name = 'android'
        } else {
            user.name = 'ios';
        }
        return http.request({
            url: "https://us-central1-firebase-goblur.cloudfunctions.net/get_token",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify(user)
        });


    }


}
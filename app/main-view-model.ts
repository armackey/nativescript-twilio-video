import { Observable, fromObject } from 'data/observable';
import { Page } from 'ui/page';
import * as app from "tns-core-modules/application";
import { View } from "ui/core/view"
import { LocalVideo, VideoActivity, RemoteVideo} from 'nativescript-twilio-video';
import * as dialogs from "ui/dialogs";
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout/stack-layout';

var http = require("http");
var permissions = require('nativescript-permissions');
const timer = require("timer");



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
    public uiview: UIView;
    localVideoView: any;
    error: string;
    videoTrack: any;
    videoActivity: VideoActivity;

    constructor(private page: Page) {
        super();

        var container = <StackLayout>this.page.getViewById('s');

        this.videoActivity = new VideoActivity();

        this.localVideo = new LocalVideo();

        this.remoteVideo = new RemoteVideo();

        this.localVideo.className = 'box';
        
        this.remoteVideo.className = 'box';

        container.insertChild(this.localVideo, 0);

        container.insertChild(this.remoteVideo, 1);
        
        this.videoActivity.localVideoView = this.localVideo.localVideoView;
        
        this.videoActivity.remoteVideoView = this.remoteVideo.remoteVideoView;

        // timer.setInterval(() => {
        //     console.log(this.videoActivity.remoteParticipants ? this.videoActivity.remoteParticipants.remoteVideoTracks[0].remoteTrack : undefined);
        // }, 3000)

        this.videoActivity.event.on('error', (reason) => {
            this.set("error", reason.object['reason']);
            console.log(JSON.stringify(reason.object['reason']));
        });
        

        this.videoActivity.event.on('didConnectToRoom', (r) => {
            if (r.object['count'] < 1) return;
            console.log("didConnectToRoom zz");
            console.log(JSON.stringify(r));
        });

        this.videoActivity.event.on('didFailToConnectWithError', (r) => {
            // if (app.ios) this.cleanupRemoteParticipant();
            
            console.log("didFailToConnectWithError");
        });

        this.videoActivity.event.on('participantDidConnect', (r) => {
            if (r.object['count'] < 1) return;
            if (app.ios && container.getChildIndex(this.remoteVideo) === -1) {
                console.log('adding view');
                this.add_remote_view(container);
            }
            
            console.log(JSON.stringify(r));
            console.log("participantDidConnect");
        });

        this.videoActivity.event.on('participantDidDisconnect', (r) => {
            if (app.ios) {
                container.removeChild(this.remoteVideo);
                // this.cleanupRemoteParticipant();
            }
            
            console.log("participantDidDisconnect");
        });

        // this.videoActivity.event.on('participantUnpublishedAudioTrack', (r) => {
        //     console.log("participantUnpublishedAudioTrack");
        // });

        // this.videoActivity.event.on('participantPublishedVideoTrack', (r) => {
        //     console.log("participantPublishedVideoTrack");
        // });

        // this.videoActivity.event.on('participantUnpublishedVideoTrack', (r) => {
        //     console.log("participantUnpublishedVideoTrack");
        // });

        // this.videoActivity.event.on('onAudioTrackSubscribed', (r) => {
        //     console.log("onAudioTrackSubscribed");
        // });

        // this.videoActivity.event.on('onAudioTrackUnsubscribed', (r) => {
        //     console.log("onAudioTrackUnsubscribed");
        // });

        this.videoActivity.event.on('onVideoTrackSubscribed', (r) => {
            console.log("onVideoTrackSubscribed 00");
            if (app.ios) {
                // this.videoTrack = this.videoActivity.remoteParticipants.remoteVideoTracks[0].remoteTrack;
                console.log(this.videoActivity.videoTrack);
                // this.add_remote_view();
                // this.videoActivity.remoteVideoView = this.remoteVideo.remoteVideoView;
            }
        });

        this.videoActivity.event.on('onVideoTrackUnsubscribed', (r) => {
            console.log("onVideoTrackUnsubscribed 00");
        });

        this.videoActivity.event.on('participantDisabledVideoTrack', (r) => {
            console.log("participantDisabledVideoTrack");
        });

        this.videoActivity.event.on('participantEnabledVideoTrack', (r) => {
            console.log("participantEnabledVideoTrack");
        });

        this.videoActivity.event.on('participantDisabledAudioTrack', (r) => {
            console.log("participantDisabledAudioTrack");
        });

        this.videoActivity.event.on('participantEnabledAudioTrack', (r) => {
            console.log("participantEnabledAudioTrack");
        });

        
        this.getPermissions()
            .then(() => {
                var t = timer.setTimeout(() => {
                    this.videoActivity.startPreview();
                    timer.clearTimeout(t);
                }, 1200)
            })
            .then(() => this.getToken())
            .then((result) => {
                var result = result.content.toJSON();
                this.videoActivity.set_access_token(result['token']);
                // this.videoActivity.accessToken = result['token'];
            })
   

    }

    // cleanupRemoteParticipant(): void {
    //     this.videoTrack.removeRenderer(this.videoActivity.remoteVideoView);
    //     this.videoActivity.remoteVideoView.removeFromSuperview();
    //     // if (this.videoActivity.remoteParticipants && this.videoActivity.remoteParticipants.videoTracks.count > 0) {
    //     //     var videoTrack = this.videoActivity.remoteParticipants.remoteVideoTracks[0].remoteTrack;
    //     //     console.log(videoTrack);
    //     //     if (videoTrack === null) return this.cleanupRemoteParticipant();

    //     //     videoTrack.removeRenderer(this.videoActivity.remoteVideoView);
            


    //     this.videoActivity.remoteParticipants = undefined;
    //     // }
    // }

    add_remote_view(c): void {
        this.remoteVideo = new RemoteVideo();
        this.videoActivity.remoteVideoView = this.remoteVideo.remoteVideoView;
        this.remoteVideo.className = 'box';
        c.insertChild(this.remoteVideo, 1);
    }


    check_permissions(): boolean {
        var audio, camera;

        if (app.android) {
            audio = permissions.hasPermission("android.permission.RECORD_AUDIO")    
            camera = permissions.hasPermission("android.permission.CAMERA") 
        } else {
            camera = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo);
            audio = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeAudio);
            if (camera < 3) camera = false;
            if (audio < 3) audio = false;
        }

        if (!audio || !camera) return false;
        else return true;

    }

    getPermissions(): Promise<any> {

        return new Promise((resolve, reject) => {
            
            var has_permissions = this.check_permissions();

            if (has_permissions) {
                resolve();
                return;
            }

            if (app.android) {
                permissions.requestPermissions([
                    "android.permission.RECORD_AUDIO",
                    "android.permission.CAMERA"
                ], "I need these permissions because I'm cool")
                    .then((response) => {
                        console.dir(response);
                        resolve(response);
                    })
                    .catch((e) => {
                        console.dir(e);
                        console.log("Uh oh, no permissions - plan B time!");
                        var has_permissions = this.check_permissions();

                        if (!has_permissions) {

                            dialogs.alert("without mic and camera permissions \n you cannot meet potential matches through video chat. \n please allow permissions in settings and try again.").then(() => {

                            });
                            
                        }
                    });

            } else {

                Promise.all([this.ios_mic_permission(), this.ios_camera_permission()])
                    .then(values => {
                        console.log(JSON.stringify(values));
                        resolve();
                    },reason => {
                        console.log(JSON.stringify(reason));
                        this.set('error', reason);
                        
                        dialogs.alert("without mic and camera permissions \n you cannot meet potential matches through video chat. \n please allow permissions in settings and try again.").then(() => {

                           UIApplication.sharedApplication.openURL(NSURL.URLWithString(UIApplicationOpenSettingsURLString));

                        });

                        reject()

                    });

            }

        })

    }

    ios_mic_permission(): Promise<any> {

        return new Promise((resolve, reject) => {
            
            var has_asked = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeAudio);

            if (has_asked === 2) {
                reject('mic permission denied');
                return;
            }

            AVAudioSession.sharedInstance().requestRecordPermission((bool) => {
                if (bool === true) {
                    resolve(bool);
                    return;
                }
                reject('mic permission denied');

            });

        })

    }

    ios_camera_permission(): Promise<any> {

        return new Promise((resolve, reject) => {
            
            var has_asked = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo);

            if (has_asked === 2) {
                reject('camera permission denied');
                return;
            }

            AVCaptureDevice.requestAccessForMediaTypeCompletionHandler(AVMediaTypeVideo, (bool) => {
                if (bool === true) {
                    resolve(bool);
                    return;
                }
                reject('camera permission denied');

            });

        })
    }


    public disconnect() {

        if (this.videoActivity.room) {

            this.videoActivity.disconnect();

        }

    }



    public add_time() {
        // console.dir(TVICameraCapturer.alloc().init().initWithFrameDelegate());
    }


    public toggle_local_audio() {

        this.videoActivity.toggle_local_audio();

    }


    public toggle_local_video() {

        this.videoActivity.toggle_local_video();

    }

    public connect_to_room(): void {    
        
        let text = this.get('textfield');

        this.videoActivity.connect_to_room(text);

    }


    public getToken(): any {
        console.log('getToken');
        let user = {
            uid: ''
        };

        if (app.android) {
            user.uid = 'android'
        } else {
            user.uid = 'ios';
        }
        
        return http.request({
            url: "https://us-central1-firebase-goblur.cloudfunctions.net/get_token",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify(user)
        });


    }


}
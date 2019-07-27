import { Observable, fromObject } from 'tns-core-modules/data/observable';
import { Page } from 'tns-core-modules/ui/page';
import * as app from "tns-core-modules/application";
import { LocalVideo, VideoActivity, RemoteVideo } from 'nativescript-twilio-video';
import * as dialogs from "tns-core-modules/ui/dialogs";
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout/stack-layout';
import { GridLayout, ItemSpec } from 'tns-core-modules/ui/layouts/grid-layout';
// import { fetch } from "fetch";
const http = require("tns-core-modules/http");
const permissions = require('nativescript-permissions');
const timer = require("tns-core-modules/timer");



export class VideoChat extends Observable {
    
    public container: any;
    public localVideo: any;
    public remoteVideo: any;
    public accessToken: string;
    public room: string;
    public name: string;
    public error: string;
    public videoActivity: VideoActivity;
	public nameEventsArray: Array<any> = [];

    constructor(private page: Page) {
        super();

        this.container = <StackLayout>this.page.getViewById('container');

        this.videoActivity = new VideoActivity();

        this.localVideo = this.page.getViewById('local-video');

        this.remoteVideo = this.page.getViewById('remote-video');

        this.videoActivity.localVideoView = this.localVideo.localVideoView;

        this.videoActivity.remoteVideoView = this.remoteVideo.remoteVideoView;

		if (app.android) {
			this.set('name', 'android')
		} else {
			this.set('name', 'ios')
		}

		this.room = 'testing-room';

        // this.add_video_views();

        this.videoActivity.event.on('error', (reason) => {
            
            console.log(reason.object['reason']);
            // this.set("error", reason.object['reason']);
			this.nameEventsArray.push({ title: reason.object['reason'].toString()})
            console.log(JSON.stringify(reason.object['reason']));
        });


        this.videoActivity.event.on('didConnectToRoom', (r) => {
            // if (r.object['count'] < 1) return;
            console.log("didConnectToRoom");
            // this.toggle_local_video_size();
        });

        this.videoActivity.event.on('didFailToConnectWithError', (r) => {
            console.log("didFailToConnectWithError");
        });

        this.videoActivity.event.on('participantDidConnect', (r) => {
            // if (r.object['count'] < 1) return;
            console.log("participantDidConnect");
            // this.toggle_local_video_size();
        });

        this.videoActivity.event.on('participantDidDisconnect', (r) => {
            console.log("participantDidDisconnect");
            // this.toggle_local_video_size();
        });

        this.videoActivity.event.on('participantUnpublishedAudioTrack', (r) => {
            console.log("participantUnpublishedAudioTrack");
        });

        this.videoActivity.event.on('participantPublishedVideoTrack', (r) => {
            console.log("participantPublishedVideoTrack");
        });

        this.videoActivity.event.on('participantUnpublishedVideoTrack', (r) => {
            console.log("participantUnpublishedVideoTrack");
        });

        this.videoActivity.event.on('onAudioTrackSubscribed', (r) => {
            console.log("onAudioTrackSubscribed");
        });

        this.videoActivity.event.on('onAudioTrackUnsubscribed', (r) => {
            console.log("onAudioTrackUnsubscribed");
        });

        this.videoActivity.event.on('onVideoTrackSubscribed', (r) => {
            console.log("onVideoTrackSubscribed");
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


        this.get_permissions()
            .then(() => {
                // i find the settimeout allows for a smoother load if you're looking for the preview to begin immediately
                var t = timer.setTimeout(() => {
                    this.videoActivity.start_preview();
                    timer.clearTimeout(t);
                }, 1200)
            });
    }

    toggle_local_video_size(): void {
        if (this.localVideo.className === 'large') {
            this.localVideo.className = 'small';
            GridLayout.setColumn(this.localVideo, 1);
            GridLayout.setRow(this.localVideo, 0);
        } else {
            this.localVideo.className = 'large';
            GridLayout.setColumn(this.localVideo, 0);
            GridLayout.setColumnSpan(this.localVideo, 2);
            GridLayout.setRowSpan(this.localVideo, 2);
        }
    }

    add_video_views(): void {
        // this.localVideo.id = 'local-video';
        this.localVideo.className = 'large';
        this.remoteVideo.id = 'remote-video';

        this.localVideo.on('tap', this.toggle_local_video_size.bind(this));

        GridLayout.setColumnSpan(this.remoteVideo, 2);
        GridLayout.setRowSpan(this.remoteVideo, 2);
        GridLayout.setRow(this.remoteVideo, 0);
        GridLayout.setColumnSpan(this.localVideo, 2);
        GridLayout.setRowSpan(this.localVideo, 2);
        GridLayout.setRow(this.localVideo, 0);
        this.container.insertChild(this.remoteVideo, 0);
        this.container.insertChild(this.localVideo, 0);
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

    get_permissions(): Promise<any> {

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

                            dialogs.alert("without mic and camera permissions \n you cannot connect. \n please allow permissions in settings and try again.").then(() => {

                            });

                        }
                    });

            } else {

                Promise.all([this.ios_mic_permission(), this.ios_camera_permission()])
                    .then(values => {
                        console.log(JSON.stringify(values));
                        resolve();
                    }, reason => {
                        console.log(JSON.stringify(reason));
                        this.set('error', reason);

                        dialogs.alert("without mic and camera permissions \n you cannot connect. \n please allow permissions in settings and try again.").then(() => {

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
		console.log('diconnect');
		console.log(this.videoActivity.room);
        if (this.videoActivity.room) {

            this.videoActivity.disconnect();

        }

    }


    public toggle_local_audio() {

        this.videoActivity.toggle_local_audio();

    }


    public toggle_local_video() {
		
		this.videoActivity.start_preview();

    }

    public connect_to_room(): void {
        if (!this.get('name') || !this.get('room') || this.get('name').length < 1 || this.get('room').length < 1)
            return this.set('error', "Missing Info.");
        else this.set('error', "");
        this.get_token()
            .then(result => {
				result = result.content.toJSON();
                if (result['message']) {
                    this.set('error', result['message']);
                    return;
                }
                this.videoActivity.set_access_token(result['twilioToken']);
                this.videoActivity.connect_to_room(this.get('room'), {video: true, audio: true});
            }, e => {
                this.set('error', e);
            });
    }


    public get_token(): Promise<any> {
        let name = this.get('name')
        return http.request({
			url: 'https://9aafb7ac.ngrok.io/twilioToken',
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({ uid: name })
        });
    }


}
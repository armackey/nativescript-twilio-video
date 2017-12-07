
import { RemoteVideo } from "./remoteVideo";
import { LocalVideo } from "./localVideo";
import { Observable, fromObject } from 'tns-core-modules/data/observable';
import { VideoActivityBase } from "../twilio-common";
import { RoomDelegate, RemoteParticipantDelegate, DelegateEvents, CameraCapturerDelegate } from "./delegates";
import * as application from "tns-core-modules/application";

declare var TVIConnectOptions,
            TVICameraCapturer,
            TVILocalVideoTrack,
            TVIRemoteParticipant,
            TwilioVideo,
            TVILocalAudioTrack,
            TVIRoom,
            TVIVideoView,
            TVIRemoteVideoTrack,
            TVICameraCaptureSourceFrontCamera;


export class VideoActivity {

    localVideoView: any;
    remoteVideoView: any;
    localVideoTrack: any;
    localAudioTrack: any;
    cameraCapturer: any;
    _cameraCapturerDelegate: any;
    accessToken: string;
    roomObj: any;
    previousMicrophoneMute: boolean;
    localParticipant: any;
    remoteParticipants: any;
    _roomListener: any;
    _participantDelegate: any;
    _roomDelegate: any;
    participant: any;
    videoTrack: any;
    // event: Observable;
    room: any;
    camera: any;
    test: string;
    
    constructor() { 

        // this.event = new Observable();
        
        // this._cameraCapturerDelegate = CameraCapturerDelegate.initWithOwner(new WeakRef(this));
        
        this._roomDelegate = RoomDelegate.initWithOwner(new WeakRef(this), this);
        
        this._participantDelegate = RemoteParticipantDelegate.initWithOwner(new WeakRef(this), this);      

    }

    // public remove_video_chat_twilio_listeners(): void {

    //     this.event.off('onConnected');
    //     this.event.off('onParticipantConnected');
    //     this.event.off('onVideoTrackAdded');
    //     this.event.off('onDisconnected');
    //     this.event.off('onConnectFailure');
    //     this.event.off('onParticipantDisconnected');
    //     this.event.off('onAudioTrackAdded');
    //     this.event.off('onVideoTrackRemoved');
    //     this.event.off('onAudioTrackEnabled');
    //     this.event.off('onAudioTrackDisabled');
    //     this.event.off('onVideoTrackEnabled');
    //     this.event.off('onVideoTrackDisabled');
    //     this.event.off('subscribedToVideoTrackPublicationForParticipant');
    //     this.event.off('unsubscribedFromVideoTrackPublicationForParticipant');
    // }



    startPreview() {
        // TVICameraCapturer is not supported with the Simulator.
        // this.camera = TVICameraCapturer.alloc().initWithSourceDelegate(TVICameraCaptureSourceFrontCamera, this._cameraCapturerDelegate);
        this.camera = TVICameraCapturer.alloc().initWithSource(TVICameraCaptureSourceFrontCamera);

        this.localVideoTrack = TVILocalVideoTrack.trackWithCapturer(this.camera);

        if (!this.localVideoTrack) {

            this.notify('Failed to add video track');

        } else {
            // Add renderer to video track for local preview
            this.localVideoTrack.addRenderer(this.localVideoView);

        }

    }

    disconnect() {
        
        this.room.disconnect();

    }

    prepareLocalMedia(): Promise<any> {
        // We will share local audio and video when we connect to room.
        // Create an audio track.
        return new Promise((resolve, reject) => {
        
            if (!this.localAudioTrack) {

                this.localAudioTrack = TVILocalAudioTrack.track();
                
                if (!this.localAudioTrack) {

                    this.notify("Failed to add audio track");

                    reject("Failed to add audio track");

                    return;

                }

            }

            // Create a video track which captures from the camera.
            if (!this.localVideoTrack) {

                this.startPreview();
                
            }

            resolve();

        });

    }

    public toggle_local_video() {

        if (this.localVideoTrack) {

            this.localVideoTrack.enabled = !this.localVideoTrack.enable;

        }

    }

    public toggle_local_audio() {

        if (this.localAudioTrack) {

            this.localAudioTrack.enabled = !this.localAudioTrack.enabled;

        }

    }

    connect_to_room(room: string): void {

        if ( !this.accessToken ) {

            this.notify('Please provide a valid token to connect to a room');

            return;

        }

        // this.room = room;

        // Prepare local media which we will share with Room Participants.
        this.prepareLocalMedia();

        var connectOptions = TVIConnectOptions.optionsWithTokenBlock(this.accessToken, (builder) => {


            // Use the local media that we prepared earlier.

            builder.audioTracks = [ this.localAudioTrack ];

            builder.videoTracks = [ this.localVideoTrack ];

            // The name of the Room where the Client will attempt to connect to. Please note that if you pass an empty
            // Room `name`, the Client will create one for you. You can get the name or sid from any connected Room.
            builder.roomName = room;


        });
            


        // Connect to the Room using the options we provided.
        this.room = TwilioVideo.connectWithOptionsDelegate(connectOptions, this._roomDelegate);

        // [self logMessage:[NSString stringWithFormat:@"Attempting to connect to room %@", self.roomTextField.text]];

    }


    cleanupRemoteParticipant() {
        if (this.remoteParticipants && this.remoteParticipants.videoTracks.count > 0) {
            this.videoTrack.removeRenderer(this.remoteVideoView);
            this.remoteVideoView.removeFromSuperview();
            this.remoteParticipants = undefined;
        }
    }

    notify(reason: string) {

        this.event.notify({
            eventName: 'error',
            object: fromObject({
                reason: reason
            })
        });

    }

    


    public connectToRoomWithListener(room) { // runs from onConnected/didConnectToRoom

        if (room.remoteParticipants.count > 0) {

            this.remoteParticipants = room.remoteParticipants[0];
            
            this.remoteParticipants.delegate = this._participantDelegate;

        }

    }

    public participant_joined_room(participant) {

        if (!this.remoteParticipants) {

            this.remoteParticipants = participant;

            this.remoteParticipants.delegate = this._participantDelegate;

        }

    }

    public set_access_token(token: string) {

        this.accessToken = token;

    }

    // public remove_remote_view(videoTrack, participant): void {
    //     console.log('remove_remote_view');
    //     if (this.remoteParticipants === participant && this.remoteVideoView !== null) {

    //         try {

    //             videoTrack.removeRenderer(this.remoteVideoView);

    //         } catch(e) {

    //             console.log(e);

    //             this.notify(e);

    //         }
            
            
    //         // this.remoteVideoView.removeFromSuperview();

    //     }

    // }

    public add_video_track(videoTrack) {

        videoTrack.addRenderer(this.remoteVideoView);

    }

    public destroy_local_video() {

        this.localVideoTrack.removeRenderer(this.localVideoView);

    }


    public configure_audio(enable: boolean): any {

        // We will share local audio and video when we connect to room.

        // Create an audio track.
        if (!this.localAudioTrack) {

            this.localAudioTrack = TVILocalAudioTrack.track();

            if (!this.localAudioTrack) {

                return 'failed to get local audio';

            }         

        } 

    }



    get event(): Observable {

        return DelegateEvents._event;

    }

    


}


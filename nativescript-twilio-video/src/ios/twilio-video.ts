
import { RemoteVideo } from "./remoteVideo";
import { LocalVideo } from "./localVideo";
import { Observable, fromObject } from 'tns-core-modules/data/observable';
import { VideoActivityBase } from "../twilio-common";
import { CameraCapturerDelegate, RoomDelegate, ParticipantDelegate, DelegateEvents } from "./delegates";

declare var TVIConnectOptions,
            TVIVideoClient,
            TVICameraCapturer,
            TVILocalVideoTrack,
            TwilioVideo,
            TVILocalAudioTrack,
            TVICameraCaptureSourceFrontCamera;


export class VideoActivity implements VideoActivityBase {

    public localVideoView: any;
    public remoteVideoView: any;
    public localVideoTrack: any;
    public localAudioTrack: any;
    public cameraCapturer: any;
    public _cameraCapturerDelegate: any;
    public accessToken: string;
    public roomObj: any;
    public previousMicrophoneMute: boolean;
    public localParticipant: any;
    public remoteParticipant: any;
    private _roomListener: any;
    private _participantDelegate: any;
    private _roomDelegate: any;
    public participant: any;

    constructor() { 
        
        this._cameraCapturerDelegate = CameraCapturerDelegate.initWithOwner(new WeakRef(this));
        
        this._roomDelegate = RoomDelegate.initWithOwner(new WeakRef(this));
        
        this._participantDelegate = ParticipantDelegate.initWithOwner(new WeakRef(this));

    }

    public connect_to_room(roomName: string) {

        if (!this.accessToken) return; // getToken();

        var connectOptions = TVIConnectOptions.optionsWithTokenBlock( this.accessToken, (builder) => {
            
            // builder.localMedia = null;

            builder.audioTracks = [this.localAudioTrack]

            builder.videoTracks = [this.localVideoTrack]

            builder.roomName = roomName;
            
            return builder;

        });
        
        this.roomObj = TwilioVideo.connectWithOptionsDelegate(connectOptions, this._roomDelegate);      
      
    }

    public createAudioAndVideoTracks() {

        this.cameraCapturer = TVICameraCapturer.alloc().init().initWithSourceDelegate(TVICameraCaptureSourceFrontCamera, this._cameraCapturerDelegate);

        this.localVideoTrack = TVILocalVideoTrack.trackWithCapturer(this.cameraCapturer);

        this.localVideoTrack.addRenderer( this.localVideoView );

        this.localVideoView.mirror = true;   

        this.configure_audio(true);


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

    public removeParticipantVideo(participant) {
        if (participant) {
            if (participant.videoTracks.count > 0) {
                participant.videoTracks[0].removeRenderer(this.remoteVideoView);
                this.remoteVideoView.removeFromSuperview();
            }

            participant = null;

            this.participant = null;
        }
    }

    public set_listener_for_participants(room) { // runs from onConnected/didConnectToRoom

        if (room.participants.count > 0) {

            let participant = room.participants[0];

            participant.delegate = this._participantDelegate;

        }

    }

    public participant_joined_room(participant) {

        if (!this.participant) {
        
            this.participant = participant;

            this.participant.delegate = this._participantDelegate;

        }

    }

    public add_video_track(videoTrack) {

        videoTrack.addRenderer(this.remoteVideoView);

    }

    public removeParticipant(participant) {

        if (participant.videoTracks.count > 0) {

            participant.videoTracks[0].removeRenderer(this.remoteVideoView);

            // this.remoteVideoView.removeFromSuperview();

        }

        participant = null;

        this.participant = null;

    }

    public set_access_token(token: string) {

        this.accessToken = token;

    }


    public toggle_local_video() {

        if (this.localVideoTrack) {

            this.localVideoTrack.enabled = !this.localVideoTrack.enabled;

        }

    }

    public toggle_local_audio() {

        if (this.localAudioTrack) {

            this.localAudioTrack.enabled = !this.localAudioTrack.enabled;

        }

    }


    public destroy_local_video() {

        this.localVideoTrack.removeRenderer( this.localVideoView );

    }


    get events(): Observable {

        return DelegateEvents._events;

    }


}


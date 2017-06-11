


import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";
import { RemoteVideo } from "./remoteVideo";
import { LocalVideo } from "./localVideo";
import { Observable, fromObject } from 'tns-core-modules/data/observable';

var app = require("application");

declare var com, android: any;

const AudioManager = android.media.AudioManager;
const LocalParticipant = com.twilio.video.LocalParticipant;
const RoomState = com.twilio.video.RoomState;
const Video = com.twilio.video.Video;
const VideoRenderer = com.twilio.video.VideoRenderer;
const TwilioException = com.twilio.video.TwilioException;
const AudioTrack = com.twilio.video.AudioTrack;
const CameraCapturer = com.twilio.video.CameraCapturer;
const ConnectOptions = com.twilio.video.ConnectOptions;
const LocalAudioTrack = com.twilio.video.LocalAudioTrack;
const LocalVideoTrack = com.twilio.video.LocalVideoTrack;
const Participant = com.twilio.video.Participant;
const Room = com.twilio.video.Room;
const VideoTrack = com.twilio.video.VideoTrack;

// const VideoView: any = com.twilio.video.VideoView;
// const videoView = new VideoView(utils.ad.getApplicationContext());

// const quickstart.R = com.twilio.video.quickstart.R;
// const quickstart.dialog.Dialog = com.twilio.video.quickstart.dialog.Dialog;
// const CameraCapturer.CameraSource = com.twilio.video.CameraCapturer.CameraSource;

export class VideoActivity {

    public previousAudioMode: any;
    public localVideoView: any; 
    public remoteVideoView: any; 
    public localVideoTrack: any;
    public localAudioTrack: any;
    public cameraCapturer: any;
    public accessToken: string;
    public TWILIO_ACCESS_TOKEN: string;
    public room: string;
    public participantIdentity: string;
    public previousMicrophoneMute: boolean;
    public localParticipant: any;
    public audioManager: any;
    public name: string;
    public name2: string;
    public videoEvent: Observable;

    constructor() {
        // super();
        let localVideo = new LocalVideo();
        let remoteVideo = new RemoteVideo();

        this.localVideoView = localVideo.get_local_view();
        this.remoteVideoView = remoteVideo.get_remote_view();
        this.audioManager = app.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
    }

    public createAudioAndVideoTracks() {

        if (this.localVideoTrack) return;

        this.localVideoView.setMirror(true);
        this.localAudioTrack = LocalAudioTrack.create(utils.ad.getApplicationContext(), true);
        this.cameraCapturer = new CameraCapturer(utils.ad.getApplicationContext(), CameraCapturer.CameraSource.FRONT_CAMERA);
        this.localVideoTrack = LocalVideoTrack.create(utils.ad.getApplicationContext(), true, this.cameraCapturer);
        this.localVideoTrack.addRenderer(this.localVideoView);



    }

    public toggle_local_video() {

        if (this.localVideoTrack) {

            let enable = !this.localVideoTrack.isEnabled();

            this.localVideoTrack.enable(enable);

        }

    }  

    public toggle_local_audio() {

        if (this.localAudioTrack) {

            let enabled = !this.localAudioTrack.isEnabled();

            this.localAudioTrack(enabled);

        }

    }

    public destroy_local_video() {

        this.localVideoTrack.removeRenderer(this.localVideoView);

        this.localVideoTrack = null
        

    }

    public destroy_local_audio() {

        this.localVideoTrack.removeRenderer(this.localVideoView);

        this.localVideoTrack = null

    }      

    public connect_to_room(roomName: string) {
        
        this.configureAudio(true);

        let connectOptionsBuilder = new ConnectOptions.Builder(this.accessToken).roomName(roomName);

        if (this.localAudioTrack !== null) {
            /*
            * Add local audio track to connect options to share with participants.
            */
            connectOptionsBuilder.audioTracks(java.util.Collections.singletonList(this.localAudioTrack));

        }

        /*
         * Add local video track to connect options to share with participants.
         */

        if (this.localVideoTrack !== null) {

            connectOptionsBuilder.videoTracks(java.util.Collections.singletonList(this.localVideoTrack));

        }

        this.room = Video.connect(utils.ad.getApplicationContext(), connectOptionsBuilder.build(), this.roomListener());


    }


    public set_access_token(token: string, name: string) {

        this.accessToken = token;

        this.name = name;

    }

    public disconnect_from_room() {
        // localParticipant
        if (!this.localParticipant) return;
        this.localParticipant.removeVideoTrack(this.localVideoTrack);
        this.localParticipant = null;
        this.localVideoTrack.release();
        this.localVideoTrack = null;        
    }


    public roomListener() {
        let self = this;
        let that = new WeakRef(this);
        self.videoEvent = new Observable();
        return new Room.Listener({
            onConnected(room) {
                let owner = that.get();
                var list = room.getParticipants();
                console.log('owner below');
                console.dir(owner);
                console.log('this: ', this)
                self.localParticipant = room.getLocalParticipant();
                

                for (var i = 0, l = list.size(); i < l; i++) {
                    var participant = list.get(i);
                    self.addParticipant(participant);
                }

                // console.log(self.name, ' connected to: ' + room.getName());
                
                console.log("onConnected: ", self.name);

                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onConnected',
                        object: fromObject({
                            room: room
                        })
                    })
                }



            },
            onConnectFailure(room, error) {
                console.log("failed to connect");
                console.log(error);
                self.configureAudio(false);
            },
            onDisconnected(room, error) {
                console.log("Disconnected from " + room.getName());
                self.room = null;
                // Only reinitialize the UI if disconnect was not called from onDestroy()
                // if (!disconnectedFromOnDestroy) {
                self.configureAudio(false);
                //     intializeUI();
                //     moveLocalVideoToPrimaryView();
                // } 
            },
            onParticipantConnected(room, participant) {
                console.log(self.name, ' participant added');
                self.addParticipant(participant);
            },
            onParticipantDisconnected(room, participant) {
                console.log('participant removed');
                self.removeParticipant(participant);
            },
            onRecordingStarted(room) {
                /*
                 * Indicates when media shared to a Room is being recorded. Note that
                 * recording is only available in our Group Rooms developer preview.
                 */
                console.log('onRecordingStarted');
            },
            onRecordingStopped(room) {
                console.log('onRecordingStopped');
            }

        });
    }

    public participant_listener() {
        let self = this;
        return new Participant.Listener({
            onAudioTrackAdded(participant, audioTrack) {
                console.log('onAudioTrackAdded');
            },
            onAudioTrackRemoved(participant, audioTrack) {
                console.log('onAudioTrackRemoved');
            },
            onVideoTrackAdded(participant, videoTrack) {
                console.log(self.name, ' onVideoTrackAdded')
                self.addParticipantVideo(videoTrack);
            },
            onVideoTrackRemoved(participant, VideoTrack) {
                console.log('onVideoTrackRemoved');
            },
            onAudioTrackEnabled(participant, AudioTrack) {

            },
            onAudioTrackDisabled(participant, AudioTrack) {

            },
            onVideoTrackEnabled(participant, VideoTrack) {
                console.log('onVideoTrackEnabled');
            },
            onVideoTrackDisabled(participant, VideoTrack) {

            }

        });
    }


    private addParticipant(participant) {
        // if (typeof participant === 'string') return;
        // this.participantIdentity = participant.getIdentity();
        // console.log('this.participantIdentity :', this.participantIdentity );

        /*
        * Add participant renderer
        */
        // console.log('participant: ', participant);
        // console.log('participant.getVideoTracks: ', participant.getVideoTracks());
        // console.log('participant.getVideoTracks().size(): ', participant.getVideoTracks().size())
        console.log('279: ');
        console.log(typeof participant);
        // console.log(Object.keys(participant));
        

        if (participant.getVideoTracks().size() > 0) {
            console.log(this.name, ' found video tracks');
            this.addParticipantVideo(participant.getVideoTracks().get(0));
        }


        /*
         * Start listening for participant events
         */
        participant.setListener(this.participant_listener());

    }

    /*
     * Set primary view as renderer for participant video track
     */
    private addParticipantVideo(videoTrack) {
        console.log(this.name, ' added video track: ', videoTrack);
        console.log(this.name, ' remote video view: ', this.remoteVideoView);
        this.localVideoView.setMirror(false);
        videoTrack.addRenderer(this.remoteVideoView);
    }

    public removeParticipant(participant) {

        console.log("Participant " + participant.getIdentity() + " left.");
        /*
         * Remove participant renderer
         */
        if (participant.getVideoTracks().size() > 0) {
            this.removeParticipantVideo(participant.getVideoTracks().get(0));
        }
        participant.setListener(null);

    }

    public removeParticipantVideo(videoTrack) { 
        console.log('removeParticipantVideo was called');
        videoTrack.removeRenderer(this.remoteVideoView);
    }

    public configureAudio(enable: boolean) {

        if (enable) {

            this.previousAudioMode = this.audioManager.getMode();

            // Request audio focus before making any device switch.
            this.audioManager.requestAudioFocus(null, AudioManager.STREAM_VOICE_CALL, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);

            /*
             * Use MODE_IN_COMMUNICATION as the default audio mode. It is required
             * to be in this mode when playout and/or recording starts for the best
             * possible VoIP performance. Some devices have difficulties with
             * speaker mode if this is not set.
             */

            this.audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);

            /*
             * Always disable microphone mute during a WebRTC call.
             */

            this.previousMicrophoneMute = this.audioManager.isMicrophoneMute();
            this.audioManager.setMicrophoneMute(false);

        } else {

            this.audioManager.setMode(this.previousAudioMode);
            this.audioManager.abandonAudioFocus(null);
            this.audioManager.setMicrophoneMute(this.previousMicrophoneMute);

        }
    }

}
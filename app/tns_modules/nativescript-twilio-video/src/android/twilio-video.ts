


import { View } from 'ui/core/view';
import * as utils from "tns-core-modules/utils/utils";
import { RemoteVideo } from "./remoteVideo";
import { LocalVideo } from "./localVideo";
import { Observable, fromObject } from 'tns-core-modules/data/observable';
import { VideoActivityBase } from "../twilio-common";

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

export class VideoActivity implements VideoActivityBase {

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
    public videoEvent: Observable;
    private _roomListener: any;
    private _participantListener: any;

    constructor() {
        // super();
        let localVideo = new LocalVideo();
        let remoteVideo = new RemoteVideo();

        this.localVideoView = localVideo.get_local_view();
        this.remoteVideoView = remoteVideo.get_remote_view();
        this.audioManager = app.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
        this.videoEvent = new Observable();
        this._roomListener = this.roomListener()
        this._participantListener = this.participantListener();
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

        this.room = Video.connect(utils.ad.getApplicationContext(), connectOptionsBuilder.build(), this._roomListener);


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

        return new Room.Listener({
            onConnected(room) {
                var list = room.getParticipants();
                self.localParticipant = room.getLocalParticipant();

                for (var i = 0, l = list.size(); i < l; i++) {
                    var participant = list.get(i);
                    self.addParticipant(participant);
                }
                
                console.log("onConnected: ", self.name);

                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onConnected',
                        object: fromObject({
                            room: room,
                            string: 'string'
                        })
                    })
                }
            },
            onConnectFailure(room, error) {
                console.log(error);
                self.configureAudio(false);
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onConnectFailure',
                        object: fromObject({
                            room: room,
                            error: error
                        })
                    })
                } 
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
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onDisconnected',
                        object: fromObject({
                            room: room,
                            error: error
                        })
                    })
                } 
            },
            onParticipantConnected(room, participant) {
                self.addParticipant(participant);
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onParticipantConnected',
                        object: fromObject({
                            room: room,
                            participant: participant
                        })
                    })
                } 
            },
            onParticipantDisconnected(room, participant) {
                self.removeParticipant(participant);
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onParticipantDisconnected',
                        object: fromObject({
                            room: room,
                            participant: participant
                        })
                    })
                } 
            },
            onRecordingStarted(room) {
                /*
                 * Indicates when media shared to a Room is being recorded. Note that
                 * recording is only available in our Group Rooms developer preview.
                 */
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onRecordingStarted',
                        object: fromObject({
                            room: room
                        })
                    })
                } 
            },
            onRecordingStopped(room) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onRecordingStopped',
                        object: fromObject({
                            room: room
                        })
                    })
                } 
            }

        });
    }

    public participantListener() {
        let self = this;
        return new Participant.Listener({
            onAudioTrackAdded(participant, audioTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onAudioTrackAdded',
                        object: fromObject({
                            participant: participant
                        })
                    })
                } 
            },
            onAudioTrackRemoved(participant, audioTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onAudioTrackRemoved',
                        object: fromObject({
                            participant: participant
                        })
                    })
                } 
            },
            onVideoTrackAdded(participant, videoTrack) {
                self.addParticipantVideo(videoTrack);
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onVideoTrackAdded',
                        object: fromObject({
                            participant: participant
                        })
                    })
                } 
            },
            onVideoTrackRemoved(participant, VideoTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onVideoTrackRemoved',
                        object: fromObject({
                            participant: participant
                        })
                    })
                } 
            },
            onAudioTrackEnabled(participant, AudioTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onAudioTrackEnabled',
                        object: fromObject({
                            participant: participant
                        })
                    })
                }
            },
            onAudioTrackDisabled(participant, AudioTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onAudioTrackDisabled',
                        object: fromObject({
                            participant: participant
                        })
                    })
                }
            },
            onVideoTrackEnabled(participant, VideoTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onVideoTrackEnabled',
                        object: fromObject({
                            participant: participant
                        })
                    })
                }
            },
            onVideoTrackDisabled(participant, VideoTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onVideoTrackDisabled',
                        object: fromObject({
                            participant: participant
                        })
                    })
                }
            }

        });
    }


    public addParticipant(participant: any) {
        

        if (participant.getVideoTracks().size() > 0) {
            this.addParticipantVideo(participant.getVideoTracks().get(0));
        }


        /*
         * Start listening for participant events
         */
        participant.setListener(this._participantListener);

    }

    /*
     * Set primary view as renderer for participant video track
     */
    public addParticipantVideo(videoTrack) {
        this.localVideoView.setMirror(false);
        videoTrack.addRenderer(this.remoteVideoView);
    }

    public removeParticipant(participant) {
        /*
         * Remove participant renderer
         */
        if (participant.getVideoTracks().size() > 0) {
            this.removeParticipantVideo(participant.getVideoTracks().get(0));
        }
        participant.setListener(null);

    }

    public removeParticipantVideo(videoTrack) { 
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
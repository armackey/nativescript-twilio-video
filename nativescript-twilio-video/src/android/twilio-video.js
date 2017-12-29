"use strict";
exports.__esModule = true;
var utils = require("tns-core-modules/utils/utils");
var observable_1 = require("tns-core-modules/data/observable");
var app = require("application");
var AudioManager = android.media.AudioManager;
var AudioAttributes = android.media.AudioAttributes;
var AudioFocusRequest = android.media.AudioFocusRequest;
var LocalParticipant = com.twilio.video.LocalParticipant;
var RoomState = com.twilio.video.RoomState;
var Video = com.twilio.video.Video;
var VideoRenderer = com.twilio.video.VideoRenderer;
var TwilioException = com.twilio.video.TwilioException;
var AudioTrack = com.twilio.video.AudioTrack;
var CameraCapturer = com.twilio.video.CameraCapturer;
// const CameraCapturerCameraSource = com.twilio.video.CameraCapturer.CameraSource;
var ConnectOptions = com.twilio.video.ConnectOptions;
var LocalAudioTrack = com.twilio.video.LocalAudioTrack;
var LocalVideoTrack = com.twilio.video.LocalVideoTrack;
// const VideoCapturer = com.twilio.video.VideoCapturer;
var Participant = com.twilio.video.RemoteParticipant;
var Room = com.twilio.video.Room;
var VideoTrack = com.twilio.video.VideoTrack;
// const CameraCapturerCompat = com.twilio.video.util.CameraCapturerCompat;
var VideoActivity = (function () {
    function VideoActivity() {
        this.audioManager = app.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
        this._event = new observable_1.Observable();
        // setVolumeControlStream(AudioManager.STREAM_VOICE_CALL);
        // application.on('suspend', () => {
        //     if (this.localVideoTrack && this.localVideoTrack !== null) {
        //         /*
        //          * If this local video track is being shared in a Room, unpublish from room before
        //          * releasing the video track. Participants will be notified that the track has been
        //          * unpublished.
        //          */
        //         if (this.localParticipant) {
        //             this.localParticipant.unpublishTrack(this.localVideoTrack);
        //         }
        //         this.localVideoTrack.release();
        //         this.localVideoTrack = null;
        //     }
        // });
    }
    Object.defineProperty(VideoActivity.prototype, "event", {
        get: function () {
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    VideoActivity.prototype.startPreview = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.localVideoTrack && _this.localVideoTrack !== null) {
                resolve();
                return;
            }
            ;
            _this.localVideoView.setMirror(true);
            // this.cameraCapturer = new CameraCapturer(utils.ad.getApplicationContext(), CameraCapturer.CameraSource.FRONT_CAMERA, this.cameraListener());
            _this.cameraCapturer = new CameraCapturer(utils.ad.getApplicationContext(), CameraCapturer.CameraSource.FRONT_CAMERA, null);
            _this.localVideoTrack = LocalVideoTrack.create(utils.ad.getApplicationContext(), true, _this.cameraCapturer);
            _this.localVideoTrack.addRenderer(_this.localVideoView);
            resolve();
        });
    };
    VideoActivity.prototype.addRemoteParticipant = function (remoteParticipant) {
        if (remoteParticipant.getRemoteVideoTracks().size() > 0) {
            var remoteVideoTrackPublication = remoteParticipant.getRemoteVideoTracks().get(0);
            if (remoteVideoTrackPublication.isTrackSubscribed()) {
                this.addRemoteParticipantVideo(remoteVideoTrackPublication.getRemoteVideoTrack());
            }
        }
        /*
         * Start listening for participant events
         */
        remoteParticipant.setListener(this.participantListener());
    };
    VideoActivity.prototype.prepareLocalMedia = function () {
        var _this = this;
        // We will share local audio and video when we connect to room.
        // Create an audio track.
        return new Promise(function (resolve, reject) {
            if (!_this.localAudioTrack) {
                _this.localAudioTrack = LocalAudioTrack.create(utils.ad.getApplicationContext(), true);
                if (!_this.localAudioTrack) {
                    _this.onError("Failed to add audio track");
                    reject("Failed to add audio track");
                    return;
                }
            }
            // Create a video track which captures from the camera.
            if (!_this.localVideoTrack) {
                _this.startPreview();
            }
            resolve();
        });
    };
    VideoActivity.prototype.onError = function (reason) {
        this._event.notify({
            eventName: 'error',
            object: observable_1.fromObject({
                reason: reason
            })
        });
    };
    VideoActivity.prototype.removeParticipantVideo = function (videoTrack) {
        videoTrack.removeRenderer(this.remoteVideoView);
    };
    VideoActivity.prototype.removeRemoteParticipant = function (remoteParticipant) {
        // if (!remoteParticipant.getIdentity().equals(remoteParticipantIdentity)) {
        //     return;
        // }
        /*
        * Remove remote participant renderer
        */
        if (!remoteParticipant.getRemoteVideoTracks().isEmpty()) {
            var remoteVideoTrackPublication = remoteParticipant.getRemoteVideoTracks().get(0);
            /*
            * Remove video only if subscribed to participant track
            */
            if (remoteVideoTrackPublication.isTrackSubscribed()) {
                this.removeParticipantVideo(remoteVideoTrackPublication.getRemoteVideoTrack());
            }
        }
    };
    VideoActivity.prototype.connect_to_room = function (roomName) {
        if (!this.accessToken) {
            this.onError('Please provide a valid token to connect to a room');
            return;
        }
        this.configure_audio(true);
        this.prepareLocalMedia();
        var connectOptionsBuilder = new ConnectOptions.Builder(this.accessToken).roomName(roomName);
        if (this.localAudioTrack) {
            /*
            * Add local audio track to connect options to share with participants.
            */
            connectOptionsBuilder.audioTracks(java.util.Collections.singletonList(this.localAudioTrack));
        }
        /*
         * Add local video track to connect options to share with participants.
         */
        if (this.localVideoTrack) {
            connectOptionsBuilder.videoTracks(java.util.Collections.singletonList(this.localVideoTrack));
        }
        this.room = Video.connect(utils.ad.getApplicationContext(), connectOptionsBuilder.build(), this.roomListener());
    };
    /*
     * Set primary view as renderer for participant video track
     */
    VideoActivity.prototype.addRemoteParticipantVideo = function (videoTrack) {
        this.remoteVideoView.setMirror(true);
        videoTrack.addRenderer(this.remoteVideoView);
    };
    VideoActivity.prototype.destroy_local_video = function () {
        this.localVideoTrack.removeRenderer(this.localVideoView);
        this.localVideoTrack = null;
    };
    VideoActivity.prototype.disconnect = function () {
        this.room.disconnect();
    };
    VideoActivity.prototype.cameraListener = function () {
        var self = this;
        return new CameraCapturer.Listener({
            onFirstFrameAvailable: function () {
                self._event.notify({
                    eventName: 'videoViewDidReceiveData',
                    object: observable_1.fromObject({
                        view: 'view'
                    })
                });
            },
            onError: function (e) {
                self.onError(e);
            }
        });
    };
    VideoActivity.prototype.roomListener = function () {
        var self = this;
        return new Room.Listener({
            onConnected: function (room) {
                var list = room.getRemoteParticipants();
                self.localParticipant = room.getLocalParticipant();
                self._event.notify({
                    eventName: 'didConnectToRoom',
                    object: observable_1.fromObject({
                        room: room,
                        count: list.size()
                    })
                });
                for (var i = 0, l = list.size(); i < l; i++) {
                    var participant = list.get(i);
                    if (participant.getVideoTracks().size() > 0) {
                        self.addRemoteParticipant(participant);
                    }
                }
            },
            onConnectFailure: function (room, error) {
                self.configure_audio(false);
                self._event.notify({
                    eventName: 'didFailToConnectWithError',
                    object: observable_1.fromObject({
                        room: room,
                        error: error
                    })
                });
            },
            onDisconnected: function (room, error) {
                self.room = '';
                self.localParticipant = null;
                self.configure_audio(false);
                if (self._event) {
                    self._event.notify({
                        eventName: 'onDisconnected',
                        object: observable_1.fromObject({
                            room: room,
                            error: error
                        })
                    });
                }
            },
            onParticipantConnected: function (room, participant) {
                console.log('participantDidConnect');
                self._event.notify({
                    eventName: 'participantDidConnect',
                    object: observable_1.fromObject({
                        room: room,
                        participant: participant,
                        count: participant.getRemoteVideoTracks().size()
                    })
                });
                self.addRemoteParticipant(participant);
            },
            onParticipantDisconnected: function (room, participant) {
                self._event.notify({
                    eventName: 'participantDidDisconnect',
                    object: observable_1.fromObject({
                        room: room,
                        participant: participant
                    })
                });
                self.removeRemoteParticipant(participant);
            },
            onRecordingStarted: function (room) {
                /*
                 * Indicates when media shared to a Room is being recorded. Note that
                 * recording is only available in our Group Rooms developer preview.
                 */
                // if (self._event) {
                //     self._event.notify({
                //         eventName: 'onRecordingStarted',
                //         object: fromObject({
                //             room: room
                //         })
                //     })
                // }
            },
            onRecordingStopped: function (room) {
                // if (self._event) {
                //     self._event.notify({
                //         eventName: 'onRecordingStopped',
                //         object: fromObject({
                //             room: room
                //         })
                //     })
                // }
            }
        });
    };
    VideoActivity.prototype.participantListener = function () {
        var self = this;
        return new Participant.Listener({
            onAudioTrackPublished: function (participant, publication) {
                self._event.notify({
                    eventName: 'participantPublishedAudioTrack',
                    object: observable_1.fromObject({
                        participant: participant,
                        publication: publication
                    })
                });
            },
            onAudioTrackUnpublished: function (participant, publication) {
                self._event.notify({
                    eventName: 'participantUnpublishedAudioTrack',
                    object: observable_1.fromObject({
                        participant: participant,
                        publication: publication
                    })
                });
            },
            onVideoTrackPublished: function (participant, publication) {
                self._event.notify({
                    eventName: 'participantPublishedVideoTrack',
                    object: observable_1.fromObject({
                        participant: participant,
                        publication: publication
                    })
                });
            },
            onVideoTrackUnpublished: function (participant, publication) {
                self._event.notify({
                    eventName: 'participantUnpublishedVideoTrack',
                    object: observable_1.fromObject({
                        participant: participant,
                        publication: publication
                    })
                });
            },
            onAudioTrackSubscribed: function (remoteParticipant, remoteAudioTrackPublication, remoteAudioTrack) {
                self._event.notify({
                    eventName: 'onAudioTrackSubscribed',
                    object: observable_1.fromObject({
                        participant: remoteParticipant,
                        publication: remoteAudioTrackPublication,
                        audioTrack: remoteAudioTrack
                    })
                });
            },
            onAudioTrackUnsubscribed: function (remoteParticipant, remoteAudioTrackPublication, remoteAudioTrack) {
                self._event.notify({
                    eventName: 'onAudioTrackUnsubscribed',
                    object: observable_1.fromObject({
                        participant: remoteParticipant,
                        publication: remoteAudioTrackPublication,
                        audioTrack: remoteAudioTrack
                    })
                });
            },
            onVideoTrackSubscribed: function (remoteParticipant, remoteVideoTrackPublication, remoteVideoTrack) {
                self.addRemoteParticipantVideo(remoteVideoTrack);
                console.log("onVideoTrackSubscribed");
                self._event.notify({
                    eventName: 'onVideoTrackSubscribed',
                    object: observable_1.fromObject({
                        participant: remoteParticipant,
                        publication: remoteVideoTrackPublication,
                        videoTrack: remoteVideoTrack
                    })
                });
            },
            onVideoTrackUnsubscribed: function (remoteParticipant, remoteVideoTrackPublication, remoteVideoTrack) {
                self.removeParticipantVideo(remoteVideoTrack);
                console.log("onVideoTrackUnsubscribed");
                self._event.notify({
                    eventName: 'onVideoTrackUnsubscribed',
                    object: observable_1.fromObject({
                        participant: remoteParticipant,
                        publication: remoteVideoTrackPublication,
                        videoTrack: remoteVideoTrack
                    })
                });
            },
            onVideoTrackDisabled: function (participant, publication) {
                self._event.notify({
                    eventName: 'participantDisabledVideoTrack',
                    object: observable_1.fromObject({
                        participant: participant,
                        publication: publication
                    })
                });
            },
            onVideoTrackEnabled: function (participant, publication) {
                self._event.notify({
                    eventName: 'participantEnabledVideoTrack',
                    object: observable_1.fromObject({
                        participant: participant,
                        publication: publication
                    })
                });
            },
            onAudioTrackDisabled: function (participant, publication) {
                self._event.notify({
                    eventName: 'participantDisabledAudioTrack',
                    object: observable_1.fromObject({
                        participant: participant,
                        publication: publication
                    })
                });
            },
            onAudioTrackEnabled: function (participant, publication) {
                self._event.notify({
                    eventName: 'participantEnabledAudioTrack',
                    object: observable_1.fromObject({
                        participant: participant,
                        publication: publication
                    })
                });
            }
        });
    };
    VideoActivity.prototype.configure_audio = function (enable) {
        if (enable) {
            this.previousAudioMode = this.audioManager.getMode();
            // Request audio focus before making any device switch.
            // this.audioManager.requestAudioFocus(null, AudioManager.STREAM_VOICE_CALL, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
            this.requestAudioFocus();
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
        }
        else {
            this.audioManager.setMode(this.previousAudioMode);
            this.audioManager.abandonAudioFocus(null);
            this.audioManager.setMicrophoneMute(this.previousMicrophoneMute);
        }
    };
    VideoActivity.prototype.requestAudioFocus = function () {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            var playbackAttributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build();
            var focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                .setAudioAttributes(playbackAttributes)
                .setAcceptsDelayedFocusGain(true)
                .setOnAudioFocusChangeListener(new AudioManager.OnAudioFocusChangeListener({
                onAudioFocusChange: function (i) {
                    console.log(i);
                }
            }).build());
            this.audioManager.requestAudioFocus(focusRequest);
        }
        else {
            this.audioManager.requestAudioFocus(null, AudioManager.STREAM_VOICE_CALL, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
        }
    };
    VideoActivity.prototype.set_access_token = function (token) {
        this.accessToken = token;
    };
    VideoActivity.prototype.toggle_local_video = function () {
        if (this.localVideoTrack) {
            var enable = !this.localVideoTrack.isEnabled();
            this.localVideoTrack.enable(enable);
        }
    };
    VideoActivity.prototype.toggle_local_audio = function () {
        if (this.localAudioTrack) {
            var enabled = !this.localAudioTrack.isEnabled();
            this.localAudioTrack.enable(enabled);
        }
    };
    return VideoActivity;
}());
exports.VideoActivity = VideoActivity;

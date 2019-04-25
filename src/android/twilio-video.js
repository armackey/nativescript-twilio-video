"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("tns-core-modules/data/observable");
var app = require("application");
var utilsModule = require("tns-core-modules/utils/utils");
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
var ConnectOptions = com.twilio.video.ConnectOptions;
var LocalAudioTrack = com.twilio.video.LocalAudioTrack;
var LocalVideoTrack = com.twilio.video.LocalVideoTrack;
var Participant = com.twilio.video.RemoteParticipant;
var Room = com.twilio.video.Room;
var VideoTrack = com.twilio.video.VideoTrack;
var VideoActivity = (function () {
    function VideoActivity() {
        this._event = new observable_1.Observable();
    }
    Object.defineProperty(VideoActivity.prototype, "event", {
        get: function () {
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    VideoActivity.prototype.setListeners = function (listeners) {
        this.roomListenersObject = {
            onConnected: true,
            onConnectFailure: listeners.onConnectFailure,
            onRecordingStarted: listeners.onRecordingStarted,
            onRecordingStopped: listeners.onRecordingStopped,
            onDisconnected: true,
            onParticipantConnected: true,
            onParticipantDisconnected: true
        };
        this.participantListenersObject = {
            onAudioTrackPublished: listeners.onAudioTrackPublished,
            onAudioTrackUnpublished: listeners.onAudioTrackUnpublished,
            onVideoTrackPublished: listeners.onVideoTrackPublished,
            onVideoTrackUnpublished: listeners.onVideoTrackUnpublished,
            onAudioTrackSubscribed: listeners.onAudioTrackSubscribed,
            onAudioTrackUnsubscribed: listeners.onAudioTrackUnsubscribed,
            onVideoTrackSubscribed: listeners.onVideoTrackSubscribed,
            onVideoTrackUnsubscribed: listeners.onVideoTrackUnsubscribed,
            onVideoTrackDisabled: listeners.onVideoTrackDisabled,
            onVideoTrackEnabled: listeners.onVideoTrackEnabled,
            onAudioTrackDisabled: listeners.onAudioTrackDisabled,
            onAudioTrackEnabled: listeners.onAudioTrackEnabled
        };
        var obj = {};
    };
    VideoActivity.prototype.connect_to_room = function (roomName, options) {
        if (!this.accessToken) {
            this.onError('Please provide a valid token to connect to a room');
            return;
        }
        var connectOptionsBuilder = new ConnectOptions.Builder(this.accessToken).roomName(roomName);
        if (options.audio) {
            app.android.foregroundActivity.setVolumeControlStream(AudioManager.STREAM_VOICE_CALL);
            this.audioManager = app.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
            this.audioManager.setSpeakerphoneOn(true);
            this.configure_audio(true);
            this.localAudioTrack = com.twilio.video.LocalAudioTrack.create(utilsModule.ad.getApplicationContext(), true, "mic");
            connectOptionsBuilder.audioTracks(java.util.Collections.singletonList(this.localAudioTrack));
        }
        if (options.video) {
            this.start_preview();
        }
        if (this.localVideoTrack && options.video) {
            connectOptionsBuilder.videoTracks(java.util.Collections.singletonList(this.localVideoTrack));
        }
        this.room = com.twilio.video.Video.connect(utilsModule.ad.getApplicationContext(), connectOptionsBuilder.build(), this.roomListener());
    };
    VideoActivity.prototype.start_preview = function () {
        if (this.localVideoTrack && this.localVideoTrack !== null) {
            return;
        }
        ;
        this.cameraCapturer = new CameraCapturer(utilsModule.ad.getApplicationContext(), CameraCapturer.CameraSource.FRONT_CAMERA, null);
        this.localVideoTrack = LocalVideoTrack.create(utilsModule.ad.getApplicationContext(), true, this.cameraCapturer, 'camera');
        this.localVideoTrack.addRenderer(this.localVideoView);
        this.localVideoView.setMirror(true);
    };
    VideoActivity.prototype.addRemoteParticipant = function (remoteParticipant) {
        if (remoteParticipant.getRemoteVideoTracks().size() > 0) {
            var remoteVideoTrackPublication = remoteParticipant.getRemoteVideoTracks().get(0);
            if (remoteVideoTrackPublication.isTrackSubscribed()) {
                this.addRemoteParticipantVideo(remoteVideoTrackPublication.getRemoteVideoTrack());
            }
        }
        remoteParticipant.setListener(this.participantListener());
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
        if (!remoteParticipant.getRemoteVideoTracks().isEmpty()) {
            var remoteVideoTrackPublication = remoteParticipant.getRemoteVideoTracks().get(0);
            if (remoteVideoTrackPublication.isTrackSubscribed()) {
                this.removeParticipantVideo(remoteVideoTrackPublication.getRemoteVideoTrack());
            }
        }
    };
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
                        view: 'view',
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
                if (self.audioManager)
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
                if (self.audioManager)
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
            },
            onRecordingStopped: function (room) {
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
            this.requestAudioFocus();
            this.audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
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
        if (android.os.Build.VERSION.SDK_INT >= 25) {
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
//# sourceMappingURL=twilio-video.js.map
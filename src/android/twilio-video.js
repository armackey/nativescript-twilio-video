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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdpbGlvLXZpZGVvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdpbGlvLXZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0RBQTBFO0FBRzFFLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUkxRCxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztBQUNoRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUN0RCxJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7QUFDMUQsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztBQUMzRCxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDN0MsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3JDLElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztBQUNyRCxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7QUFDekQsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQy9DLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztBQUV2RCxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7QUFDdkQsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLE1BQU0s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O1FBRXpDLENBQUM7SUFFTCxDQUFDO0lBRUwsb0JBQUM7QUFBRCxDQUFDLEFBL3BCRCxJQStwQkM7QUEvcEJZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tT2JqZWN0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGUnO1xuaW1wb3J0IHsgVmlkZW9BY3Rpdml0eUJhc2UgfSBmcm9tICcuLi90d2lsaW8tY29tbW9uJztcblxudmFyIGFwcCA9IHJlcXVpcmUoXCJhcHBsaWNhdGlvblwiKTtcbnZhciB1dGlsc01vZHVsZSA9IHJlcXVpcmUoXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCIpO1xuXG5kZWNsYXJlIHZhciBjb20sIGFuZHJvaWQsIGphdmE6IGFueTtcblxuY29uc3QgQXVkaW9NYW5hZ2VyID0gYW5kcm9pZC5tZWRpYS5BdWRpb01hbmFnZXI7XG5jb25zdCBBdWRpb0F0dHJpYnV0ZXMgPSBhbmRyb2lkLm1lZGlhLkF1ZGlvQXR0cmlidXRlcztcbmNvbnN0IEF1ZGlvRm9jdXNSZXF1ZXN0ID0gYW5kcm9pZC5tZWRpYS5BdWRpb0ZvY3VzUmVxdWVzdDtcbmNvbnN0IExvY2FsUGFydGljaXBhbnQgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsUGFydGljaXBhbnQ7XG5jb25zdCBSb29tU3RhdGUgPSBjb20udHdpbGlvLnZpZGVvLlJvb21TdGF0ZTtcbmNvbnN0IFZpZGVvID0gY29tLnR3aWxpby52aWRlby5WaWRlbztcbmNvbnN0IFZpZGVvUmVuZGVyZXIgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvUmVuZGVyZXI7XG5jb25zdCBUd2lsaW9FeGNlcHRpb24gPSBjb20udHdpbGlvLnZpZGVvLlR3aWxpb0V4Y2VwdGlvbjtcbmNvbnN0IEF1ZGlvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkF1ZGlvVHJhY2s7XG5jb25zdCBDYW1lcmFDYXB0dXJlciA9IGNvbS50d2lsaW8udmlkZW8uQ2FtZXJhQ2FwdHVyZXI7XG4vLyBjb25zdCBDYW1lcmFDYXB0dXJlckNhbWVyYVNvdXJjZSA9IGNvbS50d2lsaW8udmlkZW8uQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlO1xuY29uc3QgQ29ubmVjdE9wdGlvbnMgPSBjb20udHdpbGlvLnZpZGVvLkNvbm5lY3RPcHRpb25zO1xuY29uc3QgTG9jYWxBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbEF1ZGlvVHJhY2s7XG5jb25zdCBMb2NhbFZpZGVvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsVmlkZW9UcmFjaztcbi8vIGNvbnN0IFZpZGVvQ2FwdHVyZXIgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvQ2FwdHVyZXI7XG5jb25zdCBQYXJ0aWNpcGFudCA9IGNvbS50d2lsaW8udmlkZW8uUmVtb3RlUGFydGljaXBhbnQ7XG5jb25zdCBSb29tID0gY29tLnR3aWxpby52aWRlby5Sb29tO1xuY29uc3QgVmlkZW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9UcmFjaztcblxuZXhwb3J0IGNsYXNzIFZpZGVvQWN0aXZpdHkgaW1wbGVtZW50cyBWaWRlb0FjdGl2aXR5QmFzZSB7XG5cbiAgICBwdWJsaWMgcHJldmlvdXNBdWRpb01vZGU6IGFueTtcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1ZpZXc6IGFueTtcbiAgICBwdWJsaWMgcmVtb3RlVmlkZW9WaWV3OiBhbnk7XG4gICAgcHVibGljIGxvY2FsVmlkZW9UcmFjazogYW55O1xuICAgIHB1YmxpYyBsb2NhbEF1ZGlvVHJhY2s6IGFueTtcbiAgICBwdWJsaWMgY2FtZXJhQ2FwdHVyZXI6IGFueTtcbiAgICBwdWJsaWMgY2FtZXJhQ2FwdHVyZXJDb21wYXQ6IGFueTtcbiAgICBwdWJsaWMgYWNjZXNzVG9rZW46IHN0cmluZztcbiAgICBwdWJsaWMgVFdJTElPX0FDQ0VTU19UT0tFTjogc3RyaW5nO1xuICAgIHB1YmxpYyByb29tOiBhbnk7XG4gICAgcHVibGljIHByZXZpb3VzTWljcm9waG9uZU11dGU6IGJvb2xlYW47XG4gICAgcHVibGljIGxvY2FsUGFydGljaXBhbnQ6IGFueTtcbiAgICBwdWJsaWMgYXVkaW9NYW5hZ2VyOiBhbnk7XG4gICAgXG4gICAgcHVibGljIHBhcnRpY2lwYW50OiBhbnk7XG5cblx0cHJpdmF0ZSBfZXZlbnQ6IE9ic2VydmFibGU7XG5cdHByaXZhdGUgcm9vbUxpc3RlbmVyc09iamVjdDoge1xuXHRcdG9uQ29ubmVjdGVkOiBib29sZWFuLFxuXHRcdG9uQ29ubmVjdEZhaWx1cmU6IGJvb2xlYW4sXG5cdFx0b25SZWNvcmRpbmdTdGFydGVkOiBib29sZWFuLFxuXHRcdG9uUmVjb3JkaW5nU3RvcHBlZDogYm9vbGVhbixcblx0XHRvbkRpc2Nvbm5lY3RlZDogYm9vbGVhbixcblx0XHRvblBhcnRpY2lwYW50Q29ubmVjdGVkOiBib29sZWFuLFxuXHRcdG9uUGFydGljaXBhbnREaXNjb25uZWN0ZWQ6IGJvb2xlYW4sXG5cdH07XG5cblx0cHJpdmF0ZSBwYXJ0aWNpcGFudExpc3RlbmVyc09iamVjdDoge1xuXHRcdG9uQXVkaW9UcmFja1B1Ymxpc2hlZDogYm9vbGVhbixcblx0XHRvbkF1ZGlvVHJhY2tVbnB1Ymxpc2hlZDogYm9vbGVhbixcblx0XHRvblZpZGVvVHJhY2tQdWJsaXNoZWQ6IGJvb2xlYW4sXG5cdFx0b25WaWRlb1RyYWNrVW5wdWJsaXNoZWQ6IGJvb2xlYW4sXG5cdFx0b25BdWRpb1RyYWNrU3Vic2NyaWJlZDogYm9vbGVhbixcblx0XHRvbkF1ZGlvVHJhY2tVbnN1YnNjcmliZWQ6IGJvb2xlYW4sXG5cdFx0b25WaWRlb1RyYWNrU3Vic2NyaWJlZDogYm9vbGVhbixcblx0XHRvblZpZGVvVHJhY2tVbnN1YnNjcmliZWQ6IGJvb2xlYW4sXG5cdFx0b25WaWRlb1RyYWNrRGlzYWJsZWQ6IGJvb2xlYW4sXG5cdFx0b25WaWRlb1RyYWNrRW5hYmxlZDogYm9vbGVhbixcblx0XHRvbkF1ZGlvVHJhY2tEaXNhYmxlZDogYm9vbGVhbixcblx0XHRvbkF1ZGlvVHJhY2tFbmFibGVkOiBib29sZWFuXG5cdH07XG5cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMuX2V2ZW50ID0gbmV3IE9ic2VydmFibGUoKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBVcGRhdGUgcHJlZmVycmVkIGF1ZGlvIGFuZCB2aWRlbyBjb2RlYyBpbiBjYXNlIGNoYW5nZWQgaW4gc2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIC8vIHRoaXMuYXVkaW9Db2RlYyA9IGdldENvZGVjUHJlZmVyZW5jZShTZXR0aW5nc0FjdGl2aXR5LlBSRUZfQVVESU9fQ09ERUMsXG4gICAgICAgIC8vICAgICBTZXR0aW5nc0FjdGl2aXR5LlBSRUZfQVVESU9fQ09ERUNfREVGQVVMVCxcbiAgICAgICAgLy8gICAgIEF1ZGlvQ29kZWMuY2xhc3MpO1xuICAgICAgICAvLyB0aGlzLnZpZGVvQ29kZWMgPSBnZXRDb2RlY1ByZWZlcmVuY2UoU2V0dGluZ3NBY3Rpdml0eS5QUkVGX1ZJREVPX0NPREVDLFxuICAgICAgICAvLyAgICAgU2V0dGluZ3NBY3Rpdml0eS5QUkVGX1ZJREVPX0NPREVDX0RFRkFVTFQsXG4gICAgICAgIC8vICAgICBWaWRlb0NvZGVjLmNsYXNzKTsgICAgICAgIFxuXG4gICAgfVxuXG4gICAgZ2V0IGV2ZW50KCk6IE9ic2VydmFibGUge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudDtcblxuICAgIH1cblxuXHQvKipcblx0ICogXG5cdCAqIEBwYXJhbSBsaXN0ZW5lcnMgXG5cdCAqIEFORFJPSUQgT05MWVxuXHQgKiBvbkNvbm5lY3RlZCwgb25EaXNjb25uZWN0ZWQsIG9uUGFydGljaXBhbnRDb25uZWN0ZWQsIGFuZCBvblBhcnRpY2lwYW50RGlzY29ubmVjdGVkIGFyZSBzZXQgYnkgZGVmYXVsdFxuXHQgKi9cblx0cHVibGljIHNldExpc3RlbmVycyhsaXN0ZW5lcnM6IHtcblx0XHRvbkNvbm5lY3RGYWlsdXJlOiBib29sZWFuLFxuXHRcdG9uUmVjb3JkaW5nU3RhcnRlZDogYm9vbGVhbixcblx0XHRvblJlY29yZGluZ1N0b3BwZWQ6IGJvb2xlYW4sXG5cdFx0b25BdWRpb1RyYWNrUHVibGlzaGVkOiBib29sZWFuLFxuXHRcdG9uQXVkaW9UcmFja1VucHVibGlzaGVkOiBib29sZWFuLFxuXHRcdG9uVmlkZW9UcmFja1B1Ymxpc2hlZDogYm9vbGVhbixcblx0XHRvblZpZGVvVHJhY2tVbnB1Ymxpc2hlZDogYm9vbGVhbixcblx0XHRvbkF1ZGlvVHJhY2tTdWJzY3JpYmVkOiBib29sZWFuLFxuXHRcdG9uQXVkaW9UcmFja1Vuc3Vic2NyaWJlZDogYm9vbGVhbixcblx0XHRvblZpZGVvVHJhY2tTdWJzY3JpYmVkOiBib29sZWFuLFxuXHRcdG9uVmlkZW9UcmFja1Vuc3Vic2NyaWJlZDogYm9vbGVhbixcblx0XHRvblZpZGVvVHJhY2tEaXNhYmxlZDogYm9vbGVhbixcblx0XHRvblZpZGVvVHJhY2tFbmFibGVkOiBib29sZWFuLFxuXHRcdG9uQXVkaW9UcmFja0Rpc2FibGVkOiBib29sZWFuLFxuXHRcdG9uQXVkaW9UcmFja0VuYWJsZWQ6IGJvb2xlYW5cblx0fSk6IHZvaWQge1xuXG5cdFx0dGhpcy5yb29tTGlzdGVuZXJzT2JqZWN0ID0ge1xuXHRcdFx0b25Db25uZWN0ZWQ6IHRydWUsXG5cdFx0XHRvbkNvbm5lY3RGYWlsdXJlOiBsaXN0ZW5lcnMub25Db25uZWN0RmFpbHVyZSxcblx0XHRcdG9uUmVjb3JkaW5nU3RhcnRlZDogbGlzdGVuZXJzLm9uUmVjb3JkaW5nU3RhcnRlZCxcblx0XHRcdG9uUmVjb3JkaW5nU3RvcHBlZDogbGlzdGVuZXJzLm9uUmVjb3JkaW5nU3RvcHBlZCxcblx0XHRcdG9uRGlzY29ubmVjdGVkOiB0cnVlLFxuXHRcdFx0b25QYXJ0aWNpcGFudENvbm5lY3RlZDogdHJ1ZSxcblx0XHRcdG9uUGFydGljaXBhbnREaXNjb25uZWN0ZWQ6IHRydWVcblx0XHR9O1xuXG5cdFx0dGhpcy5wYXJ0aWNpcGFudExpc3RlbmVyc09iamVjdCA9IHtcblx0XHRcdG9uQXVkaW9UcmFja1B1Ymxpc2hlZDogbGlzdGVuZXJzLm9uQXVkaW9UcmFja1B1Ymxpc2hlZCxcblx0XHRcdG9uQXVkaW9UcmFja1VucHVibGlzaGVkOiBsaXN0ZW5lcnMub25BdWRpb1RyYWNrVW5wdWJsaXNoZWQsXG5cdFx0XHRvblZpZGVvVHJhY2tQdWJsaXNoZWQ6IGxpc3RlbmVycy5vblZpZGVvVHJhY2tQdWJsaXNoZWQsXG5cdFx0XHRvblZpZGVvVHJhY2tVbnB1Ymxpc2hlZDogbGlzdGVuZXJzLm9uVmlkZW9UcmFja1VucHVibGlzaGVkLFxuXHRcdFx0b25BdWRpb1RyYWNrU3Vic2NyaWJlZDogbGlzdGVuZXJzLm9uQXVkaW9UcmFja1N1YnNjcmliZWQsXG5cdFx0XHRvbkF1ZGlvVHJhY2tVbnN1YnNjcmliZWQ6IGxpc3RlbmVycy5vbkF1ZGlvVHJhY2tVbnN1YnNjcmliZWQsXG5cdFx0XHRvblZpZGVvVHJhY2tTdWJzY3JpYmVkOiBsaXN0ZW5lcnMub25WaWRlb1RyYWNrU3Vic2NyaWJlZCxcblx0XHRcdG9uVmlkZW9UcmFja1Vuc3Vic2NyaWJlZDogbGlzdGVuZXJzLm9uVmlkZW9UcmFja1Vuc3Vic2NyaWJlZCxcblx0XHRcdG9uVmlkZW9UcmFja0Rpc2FibGVkOiBsaXN0ZW5lcnMub25WaWRlb1RyYWNrRGlzYWJsZWQsXG5cdFx0XHRvblZpZGVvVHJhY2tFbmFibGVkOiBsaXN0ZW5lcnMub25WaWRlb1RyYWNrRW5hYmxlZCxcblx0XHRcdG9uQXVkaW9UcmFja0Rpc2FibGVkOiBsaXN0ZW5lcnMub25BdWRpb1RyYWNrRGlzYWJsZWQsXG5cdFx0XHRvbkF1ZGlvVHJhY2tFbmFibGVkOiBsaXN0ZW5lcnMub25BdWRpb1RyYWNrRW5hYmxlZFxuXHRcdH07XG5cblx0XHRsZXQgb2JqID0ge1xuXG5cdFx0fVxuXG5cdH1cblxuICAgIHB1YmxpYyBjb25uZWN0X3RvX3Jvb20ocm9vbU5hbWU6IHN0cmluZywgb3B0aW9uczogeyB2aWRlbzogYm9vbGVhbiwgYXVkaW86IGJvb2xlYW4gfSkge1xuXG4gICAgICAgIGlmICghdGhpcy5hY2Nlc3NUb2tlbikge1xuXG4gICAgICAgICAgICB0aGlzLm9uRXJyb3IoJ1BsZWFzZSBwcm92aWRlIGEgdmFsaWQgdG9rZW4gdG8gY29ubmVjdCB0byBhIHJvb20nKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH1cblxuXG5cblx0XHRsZXQgY29ubmVjdE9wdGlvbnNCdWlsZGVyID0gbmV3IENvbm5lY3RPcHRpb25zLkJ1aWxkZXIodGhpcy5hY2Nlc3NUb2tlbikucm9vbU5hbWUocm9vbU5hbWUpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmF1ZGlvKSB7XG5cbiAgICAgICAgICAgIGFwcC5hbmRyb2lkLmZvcmVncm91bmRBY3Rpdml0eS5zZXRWb2x1bWVDb250cm9sU3RyZWFtKEF1ZGlvTWFuYWdlci5TVFJFQU1fVk9JQ0VfQ0FMTCk7XG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyID0gYXBwLmFuZHJvaWQuY29udGV4dC5nZXRTeXN0ZW1TZXJ2aWNlKGFuZHJvaWQuY29udGVudC5Db250ZXh0LkFVRElPX1NFUlZJQ0UpO1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRTcGVha2VycGhvbmVPbih0cnVlKTtcblxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmVfYXVkaW8odHJ1ZSk7XG5cbiAgICAgICAgICAgIHRoaXMubG9jYWxBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbEF1ZGlvVHJhY2suY3JlYXRlKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlLCBcIm1pY1wiKTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICogQWRkIGxvY2FsIGF1ZGlvIHRyYWNrIHRvIGNvbm5lY3Qgb3B0aW9ucyB0byBzaGFyZSB3aXRoIHBhcnRpY2lwYW50cy5cbiAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIGNvbm5lY3RPcHRpb25zQnVpbGRlci5hdWRpb1RyYWNrcyhqYXZhLnV0aWwuQ29sbGVjdGlvbnMuc2luZ2xldG9uTGlzdCh0aGlzLmxvY2FsQXVkaW9UcmFjaykpO1xuXG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEFkZCBsb2NhbCB2aWRlbyB0cmFjayB0byBjb25uZWN0IG9wdGlvbnMgdG8gc2hhcmUgd2l0aCBwYXJ0aWNpcGFudHMuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAob3B0aW9ucy52aWRlbykge1xuXG4gICAgICAgICAgICB0aGlzLnN0YXJ0X3ByZXZpZXcoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubG9jYWxWaWRlb1RyYWNrICYmIG9wdGlvbnMudmlkZW8pIHtcblxuXHRcdFx0Ly8gdGhpcy5wYXJ0aWNpcGFudExpc3RlbmVyc09iamVjdC5vblZpZGVvVHJhY2tTdWJzY3JpYmVkID0gdHJ1ZTtcblxuXHRcdFx0Ly8gdGhpcy5wYXJ0aWNpcGFudExpc3RlbmVyc09iamVjdC5vblZpZGVvVHJhY2tVbnB1Ymxpc2hlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGNvbm5lY3RPcHRpb25zQnVpbGRlci52aWRlb1RyYWNrcyhqYXZhLnV0aWwuQ29sbGVjdGlvbnMuc2luZ2xldG9uTGlzdCh0aGlzLmxvY2FsVmlkZW9UcmFjaykpO1xuXHRcdFx0XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIFNldCB0aGUgcHJlZmVycmVkIGF1ZGlvIGFuZCB2aWRlbyBjb2RlYyBmb3IgbWVkaWEuXG4gICAgICAgICAqL1xuICAgICAgICAvLyBjb25uZWN0T3B0aW9uc0J1aWxkZXIucHJlZmVyQXVkaW9Db2RlY3MoamF2YS51dGlsLkNvbGxlY3Rpb25zLnNpbmdsZXRvbkxpc3QoYXVkaW9Db2RlYykpO1xuICAgICAgICAvLyBjb25uZWN0T3B0aW9uc0J1aWxkZXIucHJlZmVyVmlkZW9Db2RlY3MoamF2YS51dGlsLkNvbGxlY3Rpb25zLnNpbmdsZXRvbkxpc3QodmlkZW9Db2RlYykpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIFNldCB0aGUgc2VuZGVyIHNpZGUgZW5jb2RpbmcgcGFyYW1ldGVycy5cbiAgICAgICAgICovXG4gICAgICAgIC8vIGNvbm5lY3RPcHRpb25zQnVpbGRlci5lbmNvZGluZ1BhcmFtZXRlcnMoZW5jb2RpbmdQYXJhbWV0ZXJzKTtcblxuICAgICAgICAvLyByb29tID0gVmlkZW8uY29ubmVjdCh0aGlzLCBjb25uZWN0T3B0aW9uc0J1aWxkZXIuYnVpbGQoKSwgcm9vbUxpc3RlbmVyKCkpO1xuICAgICAgICAvLyBzZXREaXNjb25uZWN0QWN0aW9uKCk7ICAgICAgICBcblx0XHQvLyBjb20udHdpbGlvLnZpZGVvLmNvbm5lY3RcbiAgICAgICAgdGhpcy5yb29tID0gY29tLnR3aWxpby52aWRlby5WaWRlby5jb25uZWN0KHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCBjb25uZWN0T3B0aW9uc0J1aWxkZXIuYnVpbGQoKSwgdGhpcy5yb29tTGlzdGVuZXIoKSk7XG4gICAgfVxuXG4gICAgc3RhcnRfcHJldmlldygpOiBhbnkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjayAmJiB0aGlzLmxvY2FsVmlkZW9UcmFjayAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgfTtcbiAgICAgICAgLy8gdGhpcy5jYW1lcmFDYXB0dXJlciA9IG5ldyBDYW1lcmFDYXB0dXJlcih1dGlsc01vZHVsZS5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlLkZST05UX0NBTUVSQSwgdGhpcy5jYW1lcmFMaXN0ZW5lcigpKTtcblxuICAgICAgICB0aGlzLmNhbWVyYUNhcHR1cmVyID0gbmV3IENhbWVyYUNhcHR1cmVyKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCBDYW1lcmFDYXB0dXJlci5DYW1lcmFTb3VyY2UuRlJPTlRfQ0FNRVJBLCBudWxsKTtcblxuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gTG9jYWxWaWRlb1RyYWNrLmNyZWF0ZSh1dGlsc01vZHVsZS5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgdHJ1ZSwgdGhpcy5jYW1lcmFDYXB0dXJlciwgJ2NhbWVyYScpO1xuXG5cbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2suYWRkUmVuZGVyZXIodGhpcy5sb2NhbFZpZGVvVmlldyk7XG5cblxuICAgICAgICB0aGlzLmxvY2FsVmlkZW9WaWV3LnNldE1pcnJvcih0cnVlKTtcblxuXG4gICAgfVxuXG5cblxuICAgIHByaXZhdGUgYWRkUmVtb3RlUGFydGljaXBhbnQocmVtb3RlUGFydGljaXBhbnQ6IGFueSkge1xuXG4gICAgICAgIGlmIChyZW1vdGVQYXJ0aWNpcGFudC5nZXRSZW1vdGVWaWRlb1RyYWNrcygpLnNpemUoKSA+IDApIHtcblxuICAgICAgICAgICAgbGV0IHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbiA9IHJlbW90ZVBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuZ2V0KDApO1xuXG4gICAgICAgICAgICBpZiAocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmlzVHJhY2tTdWJzY3JpYmVkKCkpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUmVtb3RlUGFydGljaXBhbnRWaWRlbyhyZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24uZ2V0UmVtb3RlVmlkZW9UcmFjaygpKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgLypcbiAgICAgICAgICogU3RhcnQgbGlzdGVuaW5nIGZvciBwYXJ0aWNpcGFudCBldmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHJlbW90ZVBhcnRpY2lwYW50LnNldExpc3RlbmVyKHRoaXMucGFydGljaXBhbnRMaXN0ZW5lcigpKTtcblxuICAgIH1cblxuXG4gICAgb25FcnJvcihyZWFzb246IHN0cmluZykge1xuICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgZXZlbnROYW1lOiAnZXJyb3InLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICByZWFzb246IHJlYXNvblxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVtb3ZlUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKSB7XG5cdFx0XG4gICAgICAgIHZpZGVvVHJhY2sucmVtb3ZlUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuXG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZVJlbW90ZVBhcnRpY2lwYW50KHJlbW90ZVBhcnRpY2lwYW50KSB7XG5cbiAgICAgICAgLy8gaWYgKCFyZW1vdGVQYXJ0aWNpcGFudC5nZXRJZGVudGl0eSgpLmVxdWFscyhyZW1vdGVQYXJ0aWNpcGFudElkZW50aXR5KSkge1xuICAgICAgICAvLyAgICAgcmV0dXJuO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLypcbiAgICAgICAgKiBSZW1vdmUgcmVtb3RlIHBhcnRpY2lwYW50IHJlbmRlcmVyXG4gICAgICAgICovXG4gICAgICAgIGlmICghcmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5pc0VtcHR5KCkpIHtcblxuICAgICAgICAgICAgbGV0IHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbiA9IHJlbW90ZVBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuZ2V0KDApO1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICogUmVtb3ZlIHZpZGVvIG9ubHkgaWYgc3Vic2NyaWJlZCB0byBwYXJ0aWNpcGFudCB0cmFja1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmIChyZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24uaXNUcmFja1N1YnNjcmliZWQoKSkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQYXJ0aWNpcGFudFZpZGVvKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5nZXRSZW1vdGVWaWRlb1RyYWNrKCkpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBTZXQgcHJpbWFyeSB2aWV3IGFzIHJlbmRlcmVyIGZvciBwYXJ0aWNpcGFudCB2aWRlbyB0cmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBhZGRSZW1vdGVQYXJ0aWNpcGFudFZpZGVvKHZpZGVvVHJhY2spIHtcblxuICAgICAgICB0aGlzLnJlbW90ZVZpZGVvVmlldy5zZXRNaXJyb3IodHJ1ZSk7XG5cbiAgICAgICAgdmlkZW9UcmFjay5hZGRSZW5kZXJlcih0aGlzLnJlbW90ZVZpZGVvVmlldyk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveV9sb2NhbF92aWRlbygpIHtcblxuICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5yZW1vdmVSZW5kZXJlcih0aGlzLmxvY2FsVmlkZW9WaWV3KTtcblxuICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjayA9IG51bGxcblxuICAgIH1cblxuXG4gICAgZGlzY29ubmVjdCgpIHtcblxuICAgICAgICB0aGlzLnJvb20uZGlzY29ubmVjdCgpO1xuXG4gICAgfVxuXG4gICAgcHVibGljIGNhbWVyYUxpc3RlbmVyKCkge1xuICAgICAgICBcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgICByZXR1cm4gbmV3IENhbWVyYUNhcHR1cmVyLkxpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uRmlyc3RGcmFtZUF2YWlsYWJsZSgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICd2aWRlb1ZpZXdEaWRSZWNlaXZlRGF0YScsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3OiAndmlldycsXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkVycm9yKGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9uRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIHJvb21MaXN0ZW5lcigpIHtcblxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cblxuXG4gICAgICAgIHJldHVybiBuZXcgUm9vbS5MaXN0ZW5lcih7XG5cbiAgICAgICAgICAgIG9uQ29ubmVjdGVkKHJvb20pIHtcblxuICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gcm9vbS5nZXRSZW1vdGVQYXJ0aWNpcGFudHMoKTtcblxuICAgICAgICAgICAgICAgIHNlbGYubG9jYWxQYXJ0aWNpcGFudCA9IHJvb20uZ2V0TG9jYWxQYXJ0aWNpcGFudCgpO1xuXG5cblxuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ2RpZENvbm5lY3RUb1Jvb20nLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBsaXN0LnNpemUoKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0LnNpemUoKTsgaSA8IGw7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNpcGFudCA9IGxpc3QuZ2V0KGkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0aWNpcGFudC5nZXRWaWRlb1RyYWNrcygpLnNpemUoKSA+IDApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbkNvbm5lY3RGYWlsdXJlKHJvb20sIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuYXVkaW9NYW5hZ2VyKVxuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvbmZpZ3VyZV9hdWRpbyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnZGlkRmFpbFRvQ29ubmVjdFdpdGhFcnJvcicsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uRGlzY29ubmVjdGVkKHJvb20sIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yb29tID0gJyc7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2NhbFBhcnRpY2lwYW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5hdWRpb01hbmFnZXIpXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY29uZmlndXJlX2F1ZGlvKGZhbHNlKVxuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25EaXNjb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvblBhcnRpY2lwYW50Q29ubmVjdGVkKHJvb20sIHBhcnRpY2lwYW50KSB7XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudERpZENvbm5lY3QnLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBwYXJ0aWNpcGFudC5nZXRSZW1vdGVWaWRlb1RyYWNrcygpLnNpemUoKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNlbGYuYWRkUmVtb3RlUGFydGljaXBhbnQocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25QYXJ0aWNpcGFudERpc2Nvbm5lY3RlZChyb29tLCBwYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlkRGlzY29ubmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvblJlY29yZGluZ1N0YXJ0ZWQocm9vbSkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICogSW5kaWNhdGVzIHdoZW4gbWVkaWEgc2hhcmVkIHRvIGEgUm9vbSBpcyBiZWluZyByZWNvcmRlZC4gTm90ZSB0aGF0XG4gICAgICAgICAgICAgICAgICogcmVjb3JkaW5nIGlzIG9ubHkgYXZhaWxhYmxlIGluIG91ciBHcm91cCBSb29tcyBkZXZlbG9wZXIgcHJldmlldy5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAvLyBpZiAoc2VsZi5fZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGV2ZW50TmFtZTogJ29uUmVjb3JkaW5nU3RhcnRlZCcsXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHJvb206IHJvb21cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLy8gICAgIH0pXG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25SZWNvcmRpbmdTdG9wcGVkKHJvb20pIHtcbiAgICAgICAgICAgICAgICAvLyBpZiAoc2VsZi5fZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGV2ZW50TmFtZTogJ29uUmVjb3JkaW5nU3RvcHBlZCcsXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHJvb206IHJvb21cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLy8gICAgIH0pXG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudExpc3RlbmVyKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUGFydGljaXBhbnQuTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25BdWRpb1RyYWNrUHVibGlzaGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50UHVibGlzaGVkQXVkaW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQXVkaW9UcmFja1VucHVibGlzaGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50VW5wdWJsaXNoZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrUHVibGlzaGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50UHVibGlzaGVkVmlkZW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uVmlkZW9UcmFja1VucHVibGlzaGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50VW5wdWJsaXNoZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BdWRpb1RyYWNrU3Vic2NyaWJlZChyZW1vdGVQYXJ0aWNpcGFudCwgcmVtb3RlQXVkaW9UcmFja1B1YmxpY2F0aW9uLCByZW1vdGVBdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25BdWRpb1RyYWNrU3Vic2NyaWJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcmVtb3RlUGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcmVtb3RlQXVkaW9UcmFja1B1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9UcmFjazogcmVtb3RlQXVkaW9UcmFja1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tVbnN1YnNjcmliZWQocmVtb3RlUGFydGljaXBhbnQsIHJlbW90ZUF1ZGlvVHJhY2tQdWJsaWNhdGlvbiwgcmVtb3RlQXVkaW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQXVkaW9UcmFja1Vuc3Vic2NyaWJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcmVtb3RlUGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcmVtb3RlQXVkaW9UcmFja1B1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9UcmFjazogcmVtb3RlQXVkaW9UcmFja1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tTdWJzY3JpYmVkKHJlbW90ZVBhcnRpY2lwYW50LCByZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24sIHJlbW90ZVZpZGVvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFJlbW90ZVBhcnRpY2lwYW50VmlkZW8ocmVtb3RlVmlkZW9UcmFjayk7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25WaWRlb1RyYWNrU3Vic2NyaWJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcmVtb3RlUGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW9UcmFjazogcmVtb3RlVmlkZW9UcmFja1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrVW5zdWJzY3JpYmVkKHJlbW90ZVBhcnRpY2lwYW50LCByZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24sIHJlbW90ZVZpZGVvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJlbW92ZVBhcnRpY2lwYW50VmlkZW8ocmVtb3RlVmlkZW9UcmFjayk7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25WaWRlb1RyYWNrVW5zdWJzY3JpYmVkJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiByZW1vdGVQYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiByZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWRlb1RyYWNrOiByZW1vdGVWaWRlb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25WaWRlb1RyYWNrRGlzYWJsZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnREaXNhYmxlZFZpZGVvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uVmlkZW9UcmFja0VuYWJsZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRFbmFibGVkVmlkZW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25BdWRpb1RyYWNrRGlzYWJsZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnREaXNhYmxlZEF1ZGlvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uQXVkaW9UcmFja0VuYWJsZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRFbmFibGVkQXVkaW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb25maWd1cmVfYXVkaW8oZW5hYmxlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGVuYWJsZSkge1xuXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzQXVkaW9Nb2RlID0gdGhpcy5hdWRpb01hbmFnZXIuZ2V0TW9kZSgpO1xuXG4gICAgICAgICAgICAvLyBSZXF1ZXN0IGF1ZGlvIGZvY3VzIGJlZm9yZSBtYWtpbmcgYW55IGRldmljZSBzd2l0Y2guXG4gICAgICAgICAgICAvLyB0aGlzLmF1ZGlvTWFuYWdlci5yZXF1ZXN0QXVkaW9Gb2N1cyhudWxsLCBBdWRpb01hbmFnZXIuU1RSRUFNX1ZPSUNFX0NBTEwsIEF1ZGlvTWFuYWdlci5BVURJT0ZPQ1VTX0dBSU5fVFJBTlNJRU5UKTtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdEF1ZGlvRm9jdXMoKTtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBVc2UgTU9ERV9JTl9DT01NVU5JQ0FUSU9OIGFzIHRoZSBkZWZhdWx0IGF1ZGlvIG1vZGUuIEl0IGlzIHJlcXVpcmVkXG4gICAgICAgICAgICAgKiB0byBiZSBpbiB0aGlzIG1vZGUgd2hlbiBwbGF5b3V0IGFuZC9vciByZWNvcmRpbmcgc3RhcnRzIGZvciB0aGUgYmVzdFxuICAgICAgICAgICAgICogcG9zc2libGUgVm9JUCBwZXJmb3JtYW5jZS4gU29tZSBkZXZpY2VzIGhhdmUgZGlmZmljdWx0aWVzIHdpdGhcbiAgICAgICAgICAgICAqIHNwZWFrZXIgbW9kZSBpZiB0aGlzIGlzIG5vdCBzZXQuXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0TW9kZShBdWRpb01hbmFnZXIuTU9ERV9JTl9DT01NVU5JQ0FUSU9OKTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIEFsd2F5cyBkaXNhYmxlIG1pY3JvcGhvbmUgbXV0ZSBkdXJpbmcgYSBXZWJSVEMgY2FsbC5cbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzTWljcm9waG9uZU11dGUgPSB0aGlzLmF1ZGlvTWFuYWdlci5pc01pY3JvcGhvbmVNdXRlKCk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNaWNyb3Bob25lTXV0ZShmYWxzZSk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0TW9kZSh0aGlzLnByZXZpb3VzQXVkaW9Nb2RlKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLmFiYW5kb25BdWRpb0ZvY3VzKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0TWljcm9waG9uZU11dGUodGhpcy5wcmV2aW91c01pY3JvcGhvbmVNdXRlKTtcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlcXVlc3RBdWRpb0ZvY3VzKCkge1xuXG4gICAgICAgIGlmIChhbmRyb2lkLm9zLkJ1aWxkLlZFUlNJT04uU0RLX0lOVCA+PSAyNSkge1xuXG4gICAgICAgICAgICAvLyB2YXIgcGxheWJhY2tBdHRyaWJ1dGVzID0gbmV3IEF1ZGlvQXR0cmlidXRlcy5CdWlsZGVyKClcbiAgICAgICAgICAgIC8vICAgICAuc2V0VXNhZ2UoQXVkaW9BdHRyaWJ1dGVzLlVTQUdFX1ZPSUNFX0NPTU1VTklDQVRJT04pXG4gICAgICAgICAgICAvLyAgICAgLnNldENvbnRlbnRUeXBlKEF1ZGlvQXR0cmlidXRlcy5DT05URU5UX1RZUEVfU1BFRUNIKVxuICAgICAgICAgICAgLy8gICAgIC5idWlsZCgpO1xuXG4gICAgICAgICAgICAvLyB0aGlzLm9uRXJyb3IoJ3BsYXliYWNrQXR0cmlidXRlcycpO1xuXG4gICAgICAgICAgICAvLyB2YXIgZm9jdXNSZXF1ZXN0ID0gbmV3IEF1ZGlvRm9jdXNSZXF1ZXN0LkJ1aWxkZXIoQXVkaW9NYW5hZ2VyLkFVRElPRk9DVVNfR0FJTl9UUkFOU0lFTlQpXG4gICAgICAgICAgICAvLyAgICAgLnNldEF1ZGlvQXR0cmlidXRlcyhwbGF5YmFja0F0dHJpYnV0ZXMpXG4gICAgICAgICAgICAvLyAgICAgLnNldEFjY2VwdHNEZWxheWVkRm9jdXNHYWluKHRydWUpXG4gICAgICAgICAgICAvLyAgICAgLnNldE9uQXVkaW9Gb2N1c0NoYW5nZUxpc3RlbmVyKFxuICAgICAgICAgICAgLy8gICAgICAgICBuZXcgQXVkaW9NYW5hZ2VyLk9uQXVkaW9Gb2N1c0NoYW5nZUxpc3RlbmVyKHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIG9uQXVkaW9Gb2N1c0NoYW5nZShpKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAgICAgfSkuYnVpbGQoKSk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMub25FcnJvcignZm9jdXNSZXF1ZXN0Jyk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMuYXVkaW9NYW5hZ2VyLnJlcXVlc3RBdWRpb0ZvY3VzKGZvY3VzUmVxdWVzdCk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIucmVxdWVzdEF1ZGlvRm9jdXMobnVsbCwgQXVkaW9NYW5hZ2VyLlNUUkVBTV9WT0lDRV9DQUxMLCBBdWRpb01hbmFnZXIuQVVESU9GT0NVU19HQUlOX1RSQU5TSUVOVCk7XG5cbiAgICAgICAgfVxuXHRcdFxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRfYWNjZXNzX3Rva2VuKHRva2VuOiBzdHJpbmcpIHtcblxuICAgICAgICB0aGlzLmFjY2Vzc1Rva2VuID0gdG9rZW47XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlID0gIXRoaXMubG9jYWxWaWRlb1RyYWNrLmlzRW5hYmxlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5lbmFibGUoZW5hYmxlKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX2F1ZGlvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsQXVkaW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlZCA9ICF0aGlzLmxvY2FsQXVkaW9UcmFjay5pc0VuYWJsZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5sb2NhbEF1ZGlvVHJhY2suZW5hYmxlKGVuYWJsZWQpO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxufSJdfQ==
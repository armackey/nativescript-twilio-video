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
    VideoActivity.prototype.connect_to_room = function (roomName, options) {
        if (!this.accessToken) {
            this.onError('Please provide a valid token to connect to a room');
            return;
        }
        var connectOptionsBuilder = new ConnectOptions.Builder(this.accessToken).roomName(roomName);
        if (!this.localAudioTrack && options.audio) {
            app.android.foregroundActivity.setVolumeControlStream(AudioManager.STREAM_VOICE_CALL);
            this.audioManager = app.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
            this.audioManager.setSpeakerphoneOn(true);
            this.configure_audio(true);
            this.localAudioTrack = com.twilio.video.LocalAudioTrack.create(utilsModule.ad.getApplicationContext(), true, "mic");
            connectOptionsBuilder.audioTracks(java.util.Collections.singletonList(this.localAudioTrack));
        }
        if (!this.localVideoTrack && options.video) {
            connectOptionsBuilder.videoTracks(java.util.Collections.singletonList(this.localVideoTrack));
        }
        this.room = com.twilio.video.Video.connect(utilsModule.ad.getApplicationContext(), connectOptionsBuilder.build(), this.roomListener());
    };
    VideoActivity.prototype.startPreview = function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdpbGlvLXZpZGVvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdpbGlvLXZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0RBQTBFO0FBRTFFLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUkxRCxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztBQUNoRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUN0RCxJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7QUFDMUQsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztBQUMzRCxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDN0MsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3JDLElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztBQUNyRCxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7QUFDekQsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQy9DLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztBQUV2RCxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7QUFDdkQsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLE1BQU0s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bkIsQ0FBQzthQUNKLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRWhCLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFdEQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3RILENBQUM7SUFDTCxDQUFDO0lBRU0sd0NBQWdCLEdBQXZCLFVBQXdCLEtBQWE7UUFFakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFFN0IsQ0FBQztJQUVNLDBDQUFrQixHQUF6QjtRQUVJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBRXZCLElBQUksTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUUvQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV4QyxDQUFDO0lBRUwsQ0FBQztJQUVNLDBDQUFrQixHQUF6QjtRQUVJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBRXZCLElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUVoRCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6QyxDQUFDO0lBRUwsQ0FBQztJQUVMLG9CQUFDO0FBQUQsQ0FBQyxBQTFoQkQsSUEwaEJDO0FBMWhCWSxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZpZXcgfSBmcm9tICd1aS9jb3JlL3ZpZXcnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHNcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb21PYmplY3QgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2RhdGEvb2JzZXJ2YWJsZSc7XG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvblwiO1xudmFyIGFwcCA9IHJlcXVpcmUoXCJhcHBsaWNhdGlvblwiKTtcbnZhciB1dGlsc01vZHVsZSA9IHJlcXVpcmUoXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCIpO1xuXG5kZWNsYXJlIHZhciBjb20sIGFuZHJvaWQ6IGFueTtcblxuY29uc3QgQXVkaW9NYW5hZ2VyID0gYW5kcm9pZC5tZWRpYS5BdWRpb01hbmFnZXI7XG5jb25zdCBBdWRpb0F0dHJpYnV0ZXMgPSBhbmRyb2lkLm1lZGlhLkF1ZGlvQXR0cmlidXRlcztcbmNvbnN0IEF1ZGlvRm9jdXNSZXF1ZXN0ID0gYW5kcm9pZC5tZWRpYS5BdWRpb0ZvY3VzUmVxdWVzdDtcbmNvbnN0IExvY2FsUGFydGljaXBhbnQgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsUGFydGljaXBhbnQ7XG5jb25zdCBSb29tU3RhdGUgPSBjb20udHdpbGlvLnZpZGVvLlJvb21TdGF0ZTtcbmNvbnN0IFZpZGVvID0gY29tLnR3aWxpby52aWRlby5WaWRlbztcbmNvbnN0IFZpZGVvUmVuZGVyZXIgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvUmVuZGVyZXI7XG5jb25zdCBUd2lsaW9FeGNlcHRpb24gPSBjb20udHdpbGlvLnZpZGVvLlR3aWxpb0V4Y2VwdGlvbjtcbmNvbnN0IEF1ZGlvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkF1ZGlvVHJhY2s7XG5jb25zdCBDYW1lcmFDYXB0dXJlciA9IGNvbS50d2lsaW8udmlkZW8uQ2FtZXJhQ2FwdHVyZXI7XG4vLyBjb25zdCBDYW1lcmFDYXB0dXJlckNhbWVyYVNvdXJjZSA9IGNvbS50d2lsaW8udmlkZW8uQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlO1xuY29uc3QgQ29ubmVjdE9wdGlvbnMgPSBjb20udHdpbGlvLnZpZGVvLkNvbm5lY3RPcHRpb25zO1xuY29uc3QgTG9jYWxBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbEF1ZGlvVHJhY2s7XG5jb25zdCBMb2NhbFZpZGVvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsVmlkZW9UcmFjaztcbi8vIGNvbnN0IFZpZGVvQ2FwdHVyZXIgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvQ2FwdHVyZXI7XG5jb25zdCBQYXJ0aWNpcGFudCA9IGNvbS50d2lsaW8udmlkZW8uUmVtb3RlUGFydGljaXBhbnQ7XG5jb25zdCBSb29tID0gY29tLnR3aWxpby52aWRlby5Sb29tO1xuY29uc3QgVmlkZW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9UcmFjaztcblxuZXhwb3J0IGNsYXNzIFZpZGVvQWN0aXZpdHkge1xuXG4gICAgcHVibGljIHByZXZpb3VzQXVkaW9Nb2RlOiBhbnk7XG4gICAgcHVibGljIGxvY2FsVmlkZW9WaWV3OiBhbnk7XG4gICAgcHVibGljIHJlbW90ZVZpZGVvVmlldzogYW55O1xuICAgIHB1YmxpYyBsb2NhbFZpZGVvVHJhY2s6IGFueTtcbiAgICBwdWJsaWMgbG9jYWxBdWRpb1RyYWNrOiBhbnk7XG4gICAgcHVibGljIGNhbWVyYUNhcHR1cmVyOiBhbnk7XG4gICAgcHVibGljIGNhbWVyYUNhcHR1cmVyQ29tcGF0OiBhbnk7XG4gICAgcHVibGljIGFjY2Vzc1Rva2VuOiBzdHJpbmc7XG4gICAgcHVibGljIFRXSUxJT19BQ0NFU1NfVE9LRU46IHN0cmluZztcbiAgICBwdWJsaWMgcm9vbTogYW55O1xuICAgIHB1YmxpYyBwcmV2aW91c01pY3JvcGhvbmVNdXRlOiBib29sZWFuO1xuICAgIHB1YmxpYyBsb2NhbFBhcnRpY2lwYW50OiBhbnk7XG4gICAgcHVibGljIGF1ZGlvTWFuYWdlcjogYW55O1xuICAgIHByaXZhdGUgX2V2ZW50OiBPYnNlcnZhYmxlO1xuICAgIHB1YmxpYyBwYXJ0aWNpcGFudDogYW55O1xuXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICB0aGlzLl9ldmVudCA9IG5ldyBPYnNlcnZhYmxlKCk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogVXBkYXRlIHByZWZlcnJlZCBhdWRpbyBhbmQgdmlkZW8gY29kZWMgaW4gY2FzZSBjaGFuZ2VkIGluIHNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICAvLyB0aGlzLmF1ZGlvQ29kZWMgPSBnZXRDb2RlY1ByZWZlcmVuY2UoU2V0dGluZ3NBY3Rpdml0eS5QUkVGX0FVRElPX0NPREVDLFxuICAgICAgICAvLyAgICAgU2V0dGluZ3NBY3Rpdml0eS5QUkVGX0FVRElPX0NPREVDX0RFRkFVTFQsXG4gICAgICAgIC8vICAgICBBdWRpb0NvZGVjLmNsYXNzKTtcbiAgICAgICAgLy8gdGhpcy52aWRlb0NvZGVjID0gZ2V0Q29kZWNQcmVmZXJlbmNlKFNldHRpbmdzQWN0aXZpdHkuUFJFRl9WSURFT19DT0RFQyxcbiAgICAgICAgLy8gICAgIFNldHRpbmdzQWN0aXZpdHkuUFJFRl9WSURFT19DT0RFQ19ERUZBVUxULFxuICAgICAgICAvLyAgICAgVmlkZW9Db2RlYy5jbGFzcyk7ICAgICAgICBcblxuICAgIH1cblxuICAgIGdldCBldmVudCgpOiBPYnNlcnZhYmxlIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnQ7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY29ubmVjdF90b19yb29tKHJvb21OYW1lOiBzdHJpbmcsIG9wdGlvbnM6IHsgdmlkZW86IGJvb2xlYW4sIGF1ZGlvOiBib29sZWFuIH0pIHtcblxuXG4gICAgICAgIGlmICghdGhpcy5hY2Nlc3NUb2tlbikge1xuXG4gICAgICAgICAgICB0aGlzLm9uRXJyb3IoJ1BsZWFzZSBwcm92aWRlIGEgdmFsaWQgdG9rZW4gdG8gY29ubmVjdCB0byBhIHJvb20nKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH1cblxuXG4gICAgICAgIGxldCBjb25uZWN0T3B0aW9uc0J1aWxkZXIgPSBuZXcgQ29ubmVjdE9wdGlvbnMuQnVpbGRlcih0aGlzLmFjY2Vzc1Rva2VuKS5yb29tTmFtZShyb29tTmFtZSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmxvY2FsQXVkaW9UcmFjayAmJiBvcHRpb25zLmF1ZGlvKSB7XG5cblxuXG4gICAgICAgICAgICBhcHAuYW5kcm9pZC5mb3JlZ3JvdW5kQWN0aXZpdHkuc2V0Vm9sdW1lQ29udHJvbFN0cmVhbShBdWRpb01hbmFnZXIuU1RSRUFNX1ZPSUNFX0NBTEwpO1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlciA9IGFwcC5hbmRyb2lkLmNvbnRleHQuZ2V0U3lzdGVtU2VydmljZShhbmRyb2lkLmNvbnRlbnQuQ29udGV4dC5BVURJT19TRVJWSUNFKTtcblxuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0U3BlYWtlcnBob25lT24odHJ1ZSk7XG5cbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJlX2F1ZGlvKHRydWUpO1xuXG5cbiAgICAgICAgICAgIHRoaXMubG9jYWxBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbEF1ZGlvVHJhY2suY3JlYXRlKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlLCBcIm1pY1wiKTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICogQWRkIGxvY2FsIGF1ZGlvIHRyYWNrIHRvIGNvbm5lY3Qgb3B0aW9ucyB0byBzaGFyZSB3aXRoIHBhcnRpY2lwYW50cy5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25uZWN0T3B0aW9uc0J1aWxkZXIuYXVkaW9UcmFja3MoamF2YS51dGlsLkNvbGxlY3Rpb25zLnNpbmdsZXRvbkxpc3QodGhpcy5sb2NhbEF1ZGlvVHJhY2spKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLypcbiAgICAgICAgICogQWRkIGxvY2FsIHZpZGVvIHRyYWNrIHRvIGNvbm5lY3Qgb3B0aW9ucyB0byBzaGFyZSB3aXRoIHBhcnRpY2lwYW50cy5cbiAgICAgICAgICovXG5cbiAgICAgICAgaWYgKCF0aGlzLmxvY2FsVmlkZW9UcmFjayAmJiBvcHRpb25zLnZpZGVvKSB7XG5cbiAgICAgICAgICAgIGNvbm5lY3RPcHRpb25zQnVpbGRlci52aWRlb1RyYWNrcyhqYXZhLnV0aWwuQ29sbGVjdGlvbnMuc2luZ2xldG9uTGlzdCh0aGlzLmxvY2FsVmlkZW9UcmFjaykpO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICAgKiBTZXQgdGhlIHByZWZlcnJlZCBhdWRpbyBhbmQgdmlkZW8gY29kZWMgZm9yIG1lZGlhLlxuICAgICAgICAgKi9cbiAgICAgICAgLy8gY29ubmVjdE9wdGlvbnNCdWlsZGVyLnByZWZlckF1ZGlvQ29kZWNzKGphdmEudXRpbC5Db2xsZWN0aW9ucy5zaW5nbGV0b25MaXN0KGF1ZGlvQ29kZWMpKTtcbiAgICAgICAgLy8gY29ubmVjdE9wdGlvbnNCdWlsZGVyLnByZWZlclZpZGVvQ29kZWNzKGphdmEudXRpbC5Db2xsZWN0aW9ucy5zaW5nbGV0b25MaXN0KHZpZGVvQ29kZWMpKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBTZXQgdGhlIHNlbmRlciBzaWRlIGVuY29kaW5nIHBhcmFtZXRlcnMuXG4gICAgICAgICAqL1xuICAgICAgICAvLyBjb25uZWN0T3B0aW9uc0J1aWxkZXIuZW5jb2RpbmdQYXJhbWV0ZXJzKGVuY29kaW5nUGFyYW1ldGVycyk7XG5cbiAgICAgICAgLy8gcm9vbSA9IFZpZGVvLmNvbm5lY3QodGhpcywgY29ubmVjdE9wdGlvbnNCdWlsZGVyLmJ1aWxkKCksIHJvb21MaXN0ZW5lcigpKTtcbiAgICAgICAgLy8gc2V0RGlzY29ubmVjdEFjdGlvbigpOyAgICAgICAgXG5cblxuICAgICAgICB0aGlzLnJvb20gPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvLmNvbm5lY3QodXRpbHNNb2R1bGUuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCksIGNvbm5lY3RPcHRpb25zQnVpbGRlci5idWlsZCgpLCB0aGlzLnJvb21MaXN0ZW5lcigpKTtcblxuICAgIH1cblxuICAgIHN0YXJ0UHJldmlldygpOiBhbnkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjayAmJiB0aGlzLmxvY2FsVmlkZW9UcmFjayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9O1xuICAgICAgICAvLyB0aGlzLmNhbWVyYUNhcHR1cmVyID0gbmV3IENhbWVyYUNhcHR1cmVyKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCBDYW1lcmFDYXB0dXJlci5DYW1lcmFTb3VyY2UuRlJPTlRfQ0FNRVJBLCB0aGlzLmNhbWVyYUxpc3RlbmVyKCkpO1xuICAgICAgICB0aGlzLmNhbWVyYUNhcHR1cmVyID0gbmV3IENhbWVyYUNhcHR1cmVyKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCBDYW1lcmFDYXB0dXJlci5DYW1lcmFTb3VyY2UuRlJPTlRfQ0FNRVJBLCBudWxsKTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sgPSBMb2NhbFZpZGVvVHJhY2suY3JlYXRlKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlLCB0aGlzLmNhbWVyYUNhcHR1cmVyLCAnY2FtZXJhJyk7XG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLmFkZFJlbmRlcmVyKHRoaXMubG9jYWxWaWRlb1ZpZXcpO1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9WaWV3LnNldE1pcnJvcih0cnVlKTtcblxuICAgIH1cblxuXG5cbiAgICBwdWJsaWMgYWRkUmVtb3RlUGFydGljaXBhbnQocmVtb3RlUGFydGljaXBhbnQ6IGFueSkge1xuICAgICAgICBpZiAocmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICBsZXQgcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uID0gcmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5nZXQoMCk7XG4gICAgICAgICAgICBpZiAocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmlzVHJhY2tTdWJzY3JpYmVkKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFJlbW90ZVBhcnRpY2lwYW50VmlkZW8ocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmdldFJlbW90ZVZpZGVvVHJhY2soKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICAvKlxuICAgICAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIHBhcnRpY2lwYW50IGV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3RlUGFydGljaXBhbnQuc2V0TGlzdGVuZXIodGhpcy5wYXJ0aWNpcGFudExpc3RlbmVyKCkpO1xuXG4gICAgfVxuXG5cbiAgICBvbkVycm9yKHJlYXNvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICBldmVudE5hbWU6ICdlcnJvcicsXG4gICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIHJlYXNvbjogcmVhc29uXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyByZW1vdmVQYXJ0aWNpcGFudFZpZGVvKHZpZGVvVHJhY2spIHtcbiAgICAgICAgdmlkZW9UcmFjay5yZW1vdmVSZW5kZXJlcih0aGlzLnJlbW90ZVZpZGVvVmlldyk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZVJlbW90ZVBhcnRpY2lwYW50KHJlbW90ZVBhcnRpY2lwYW50KSB7XG5cbiAgICAgICAgLy8gaWYgKCFyZW1vdGVQYXJ0aWNpcGFudC5nZXRJZGVudGl0eSgpLmVxdWFscyhyZW1vdGVQYXJ0aWNpcGFudElkZW50aXR5KSkge1xuICAgICAgICAvLyAgICAgcmV0dXJuO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLypcbiAgICAgICAgKiBSZW1vdmUgcmVtb3RlIHBhcnRpY2lwYW50IHJlbmRlcmVyXG4gICAgICAgICovXG4gICAgICAgIGlmICghcmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgIGxldCByZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24gPSByZW1vdGVQYXJ0aWNpcGFudC5nZXRSZW1vdGVWaWRlb1RyYWNrcygpLmdldCgwKTtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAqIFJlbW92ZSB2aWRlbyBvbmx5IGlmIHN1YnNjcmliZWQgdG8gcGFydGljaXBhbnQgdHJhY2tcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmlzVHJhY2tTdWJzY3JpYmVkKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVBhcnRpY2lwYW50VmlkZW8ocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmdldFJlbW90ZVZpZGVvVHJhY2soKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qXG4gICAgICogU2V0IHByaW1hcnkgdmlldyBhcyByZW5kZXJlciBmb3IgcGFydGljaXBhbnQgdmlkZW8gdHJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkUmVtb3RlUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKSB7XG4gICAgICAgIHRoaXMucmVtb3RlVmlkZW9WaWV3LnNldE1pcnJvcih0cnVlKTtcbiAgICAgICAgdmlkZW9UcmFjay5hZGRSZW5kZXJlcih0aGlzLnJlbW90ZVZpZGVvVmlldyk7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3lfbG9jYWxfdmlkZW8oKSB7XG5cbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sucmVtb3ZlUmVuZGVyZXIodGhpcy5sb2NhbFZpZGVvVmlldyk7XG5cbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sgPSBudWxsXG5cbiAgICB9XG5cblxuICAgIGRpc2Nvbm5lY3QoKSB7XG5cbiAgICAgICAgdGhpcy5yb29tLmRpc2Nvbm5lY3QoKTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBjYW1lcmFMaXN0ZW5lcigpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgQ2FtZXJhQ2FwdHVyZXIuTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25GaXJzdEZyYW1lQXZhaWxhYmxlKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3ZpZGVvVmlld0RpZFJlY2VpdmVEYXRhJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXc6ICd2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uRXJyb3IoZSkge1xuICAgICAgICAgICAgICAgIHNlbGYub25FcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIHB1YmxpYyByb29tTGlzdGVuZXIoKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICByZXR1cm4gbmV3IFJvb20uTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25Db25uZWN0ZWQocm9vbSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSByb29tLmdldFJlbW90ZVBhcnRpY2lwYW50cygpO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5sb2NhbFBhcnRpY2lwYW50ID0gcm9vbS5nZXRMb2NhbFBhcnRpY2lwYW50KCk7XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdkaWRDb25uZWN0VG9Sb29tJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogbGlzdC5zaXplKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0LnNpemUoKTsgaSA8IGw7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNpcGFudCA9IGxpc3QuZ2V0KGkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0aWNpcGFudC5nZXRWaWRlb1RyYWNrcygpLnNpemUoKSA+IDApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25Db25uZWN0RmFpbHVyZShyb29tLCBlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmF1ZGlvTWFuYWdlcilcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb25maWd1cmVfYXVkaW8oZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ2RpZEZhaWxUb0Nvbm5lY3RXaXRoRXJyb3InLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25EaXNjb25uZWN0ZWQocm9vbSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJvb20gPSAnJztcbiAgICAgICAgICAgICAgICBzZWxmLmxvY2FsUGFydGljaXBhbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmF1ZGlvTWFuYWdlcilcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb25maWd1cmVfYXVkaW8oZmFsc2UpXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkRpc2Nvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblBhcnRpY2lwYW50Q29ubmVjdGVkKHJvb20sIHBhcnRpY2lwYW50KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3BhcnRpY2lwYW50RGlkQ29ubmVjdCcpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlkQ29ubmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuc2l6ZSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGRSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25QYXJ0aWNpcGFudERpc2Nvbm5lY3RlZChyb29tLCBwYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlkRGlzY29ubmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZWNvcmRpbmdTdGFydGVkKHJvb20pIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIEluZGljYXRlcyB3aGVuIG1lZGlhIHNoYXJlZCB0byBhIFJvb20gaXMgYmVpbmcgcmVjb3JkZWQuIE5vdGUgdGhhdFxuICAgICAgICAgICAgICAgICAqIHJlY29yZGluZyBpcyBvbmx5IGF2YWlsYWJsZSBpbiBvdXIgR3JvdXAgUm9vbXMgZGV2ZWxvcGVyIHByZXZpZXcuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgLy8gaWYgKHNlbGYuX2V2ZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBldmVudE5hbWU6ICdvblJlY29yZGluZ1N0YXJ0ZWQnLFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICByb29tOiByb29tXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblJlY29yZGluZ1N0b3BwZWQocm9vbSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIChzZWxmLl9ldmVudCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgZXZlbnROYW1lOiAnb25SZWNvcmRpbmdTdG9wcGVkJyxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgcm9vbTogcm9vbVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHBhcnRpY2lwYW50TGlzdGVuZXIoKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyBQYXJ0aWNpcGFudC5MaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tQdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRQdWJsaXNoZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BdWRpb1RyYWNrVW5wdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRVbnB1Ymxpc2hlZEF1ZGlvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tQdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRQdWJsaXNoZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrVW5wdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRVbnB1Ymxpc2hlZFZpZGVvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tTdWJzY3JpYmVkKHJlbW90ZVBhcnRpY2lwYW50LCByZW1vdGVBdWRpb1RyYWNrUHVibGljYXRpb24sIHJlbW90ZUF1ZGlvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkF1ZGlvVHJhY2tTdWJzY3JpYmVkJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiByZW1vdGVQYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiByZW1vdGVBdWRpb1RyYWNrUHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBhdWRpb1RyYWNrOiByZW1vdGVBdWRpb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQXVkaW9UcmFja1Vuc3Vic2NyaWJlZChyZW1vdGVQYXJ0aWNpcGFudCwgcmVtb3RlQXVkaW9UcmFja1B1YmxpY2F0aW9uLCByZW1vdGVBdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25BdWRpb1RyYWNrVW5zdWJzY3JpYmVkJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiByZW1vdGVQYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiByZW1vdGVBdWRpb1RyYWNrUHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBhdWRpb1RyYWNrOiByZW1vdGVBdWRpb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uVmlkZW9UcmFja1N1YnNjcmliZWQocmVtb3RlUGFydGljaXBhbnQsIHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbiwgcmVtb3RlVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHNlbGYuYWRkUmVtb3RlUGFydGljaXBhbnRWaWRlbyhyZW1vdGVWaWRlb1RyYWNrKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uVmlkZW9UcmFja1N1YnNjcmliZWRcIilcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tTdWJzY3JpYmVkJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiByZW1vdGVQYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiByZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWRlb1RyYWNrOiByZW1vdGVWaWRlb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tVbnN1YnNjcmliZWQocmVtb3RlUGFydGljaXBhbnQsIHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbiwgcmVtb3RlVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlUGFydGljaXBhbnRWaWRlbyhyZW1vdGVWaWRlb1RyYWNrKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uVmlkZW9UcmFja1Vuc3Vic2NyaWJlZFwiKVxuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uVmlkZW9UcmFja1Vuc3Vic2NyaWJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcmVtb3RlUGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW9UcmFjazogcmVtb3RlVmlkZW9UcmFja1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uVmlkZW9UcmFja0Rpc2FibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlzYWJsZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tFbmFibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RW5hYmxlZFZpZGVvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uQXVkaW9UcmFja0Rpc2FibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlzYWJsZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tFbmFibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RW5hYmxlZEF1ZGlvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29uZmlndXJlX2F1ZGlvKGVuYWJsZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChlbmFibGUpIHtcblxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0F1ZGlvTW9kZSA9IHRoaXMuYXVkaW9NYW5hZ2VyLmdldE1vZGUoKTtcblxuICAgICAgICAgICAgLy8gUmVxdWVzdCBhdWRpbyBmb2N1cyBiZWZvcmUgbWFraW5nIGFueSBkZXZpY2Ugc3dpdGNoLlxuICAgICAgICAgICAgLy8gdGhpcy5hdWRpb01hbmFnZXIucmVxdWVzdEF1ZGlvRm9jdXMobnVsbCwgQXVkaW9NYW5hZ2VyLlNUUkVBTV9WT0lDRV9DQUxMLCBBdWRpb01hbmFnZXIuQVVESU9GT0NVU19HQUlOX1RSQU5TSUVOVCk7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RBdWRpb0ZvY3VzKCk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogVXNlIE1PREVfSU5fQ09NTVVOSUNBVElPTiBhcyB0aGUgZGVmYXVsdCBhdWRpbyBtb2RlLiBJdCBpcyByZXF1aXJlZFxuICAgICAgICAgICAgICogdG8gYmUgaW4gdGhpcyBtb2RlIHdoZW4gcGxheW91dCBhbmQvb3IgcmVjb3JkaW5nIHN0YXJ0cyBmb3IgdGhlIGJlc3RcbiAgICAgICAgICAgICAqIHBvc3NpYmxlIFZvSVAgcGVyZm9ybWFuY2UuIFNvbWUgZGV2aWNlcyBoYXZlIGRpZmZpY3VsdGllcyB3aXRoXG4gICAgICAgICAgICAgKiBzcGVha2VyIG1vZGUgaWYgdGhpcyBpcyBub3Qgc2V0LlxuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1vZGUoQXVkaW9NYW5hZ2VyLk1PREVfSU5fQ09NTVVOSUNBVElPTik7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBBbHdheXMgZGlzYWJsZSBtaWNyb3Bob25lIG11dGUgZHVyaW5nIGEgV2ViUlRDIGNhbGwuXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c01pY3JvcGhvbmVNdXRlID0gdGhpcy5hdWRpb01hbmFnZXIuaXNNaWNyb3Bob25lTXV0ZSgpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0TWljcm9waG9uZU11dGUoZmFsc2UpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1vZGUodGhpcy5wcmV2aW91c0F1ZGlvTW9kZSk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5hYmFuZG9uQXVkaW9Gb2N1cyhudWxsKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1pY3JvcGhvbmVNdXRlKHRoaXMucHJldmlvdXNNaWNyb3Bob25lTXV0ZSk7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZXF1ZXN0QXVkaW9Gb2N1cygpIHtcbiAgICAgICAgaWYgKGFuZHJvaWQub3MuQnVpbGQuVkVSU0lPTi5TREtfSU5UID49IDI1KSB7XG5cbiAgICAgICAgICAgIHZhciBwbGF5YmFja0F0dHJpYnV0ZXMgPSBuZXcgQXVkaW9BdHRyaWJ1dGVzLkJ1aWxkZXIoKVxuICAgICAgICAgICAgICAgIC5zZXRVc2FnZShBdWRpb0F0dHJpYnV0ZXMuVVNBR0VfVk9JQ0VfQ09NTVVOSUNBVElPTilcbiAgICAgICAgICAgICAgICAuc2V0Q29udGVudFR5cGUoQXVkaW9BdHRyaWJ1dGVzLkNPTlRFTlRfVFlQRV9TUEVFQ0gpXG4gICAgICAgICAgICAgICAgLmJ1aWxkKCk7XG5cbiAgICAgICAgICAgIHZhciBmb2N1c1JlcXVlc3QgPSBuZXcgQXVkaW9Gb2N1c1JlcXVlc3QuQnVpbGRlcihBdWRpb01hbmFnZXIuQVVESU9GT0NVU19HQUlOX1RSQU5TSUVOVClcbiAgICAgICAgICAgICAgICAuc2V0QXVkaW9BdHRyaWJ1dGVzKHBsYXliYWNrQXR0cmlidXRlcylcbiAgICAgICAgICAgICAgICAuc2V0QWNjZXB0c0RlbGF5ZWRGb2N1c0dhaW4odHJ1ZSlcbiAgICAgICAgICAgICAgICAuc2V0T25BdWRpb0ZvY3VzQ2hhbmdlTGlzdGVuZXIobmV3IEF1ZGlvTWFuYWdlci5PbkF1ZGlvRm9jdXNDaGFuZ2VMaXN0ZW5lcih7XG4gICAgICAgICAgICAgICAgICAgIG9uQXVkaW9Gb2N1c0NoYW5nZShpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmJ1aWxkKCkpO1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5yZXF1ZXN0QXVkaW9Gb2N1cyhmb2N1c1JlcXVlc3QpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5yZXF1ZXN0QXVkaW9Gb2N1cyhudWxsLCBBdWRpb01hbmFnZXIuU1RSRUFNX1ZPSUNFX0NBTEwsIEF1ZGlvTWFuYWdlci5BVURJT0ZPQ1VTX0dBSU5fVFJBTlNJRU5UKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRfYWNjZXNzX3Rva2VuKHRva2VuOiBzdHJpbmcpIHtcblxuICAgICAgICB0aGlzLmFjY2Vzc1Rva2VuID0gdG9rZW47XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlID0gIXRoaXMubG9jYWxWaWRlb1RyYWNrLmlzRW5hYmxlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5lbmFibGUoZW5hYmxlKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX2F1ZGlvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsQXVkaW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlZCA9ICF0aGlzLmxvY2FsQXVkaW9UcmFjay5pc0VuYWJsZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5sb2NhbEF1ZGlvVHJhY2suZW5hYmxlKGVuYWJsZWQpO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxufSJdfQ==
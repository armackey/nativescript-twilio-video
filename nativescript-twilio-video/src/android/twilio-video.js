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
            console.log('this.accessToken');
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
        if (this.localVideoTrack && options.video) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdpbGlvLXZpZGVvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdpbGlvLXZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0RBQTBFO0FBQzFFLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUkxRCxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztBQUNoRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUN0RCxJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7QUFDMUQsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztBQUMzRCxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDN0MsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3JDLElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztBQUNyRCxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7QUFDekQsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQy9DLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztBQUV2RCxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7QUFDdkQsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLE1BQU0s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QyxDQUFDO1lBRXZCLElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUVoRCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6QyxDQUFDO0lBRUwsQ0FBQztJQUVMLG9CQUFDO0FBQUQsQ0FBQyxBQS9oQkQsSUEraEJDO0FBL2hCWSxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZpZXcgfSBmcm9tICd1aS9jb3JlL3ZpZXcnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHNcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb21PYmplY3QgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2RhdGEvb2JzZXJ2YWJsZSc7XG52YXIgYXBwID0gcmVxdWlyZShcImFwcGxpY2F0aW9uXCIpO1xudmFyIHV0aWxzTW9kdWxlID0gcmVxdWlyZShcInRucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHNcIik7XG5cbmRlY2xhcmUgdmFyIGNvbSwgYW5kcm9pZDogYW55O1xuXG5jb25zdCBBdWRpb01hbmFnZXIgPSBhbmRyb2lkLm1lZGlhLkF1ZGlvTWFuYWdlcjtcbmNvbnN0IEF1ZGlvQXR0cmlidXRlcyA9IGFuZHJvaWQubWVkaWEuQXVkaW9BdHRyaWJ1dGVzO1xuY29uc3QgQXVkaW9Gb2N1c1JlcXVlc3QgPSBhbmRyb2lkLm1lZGlhLkF1ZGlvRm9jdXNSZXF1ZXN0O1xuY29uc3QgTG9jYWxQYXJ0aWNpcGFudCA9IGNvbS50d2lsaW8udmlkZW8uTG9jYWxQYXJ0aWNpcGFudDtcbmNvbnN0IFJvb21TdGF0ZSA9IGNvbS50d2lsaW8udmlkZW8uUm9vbVN0YXRlO1xuY29uc3QgVmlkZW8gPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvO1xuY29uc3QgVmlkZW9SZW5kZXJlciA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9SZW5kZXJlcjtcbmNvbnN0IFR3aWxpb0V4Y2VwdGlvbiA9IGNvbS50d2lsaW8udmlkZW8uVHdpbGlvRXhjZXB0aW9uO1xuY29uc3QgQXVkaW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uQXVkaW9UcmFjaztcbmNvbnN0IENhbWVyYUNhcHR1cmVyID0gY29tLnR3aWxpby52aWRlby5DYW1lcmFDYXB0dXJlcjtcbi8vIGNvbnN0IENhbWVyYUNhcHR1cmVyQ2FtZXJhU291cmNlID0gY29tLnR3aWxpby52aWRlby5DYW1lcmFDYXB0dXJlci5DYW1lcmFTb3VyY2U7XG5jb25zdCBDb25uZWN0T3B0aW9ucyA9IGNvbS50d2lsaW8udmlkZW8uQ29ubmVjdE9wdGlvbnM7XG5jb25zdCBMb2NhbEF1ZGlvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsQXVkaW9UcmFjaztcbmNvbnN0IExvY2FsVmlkZW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uTG9jYWxWaWRlb1RyYWNrO1xuLy8gY29uc3QgVmlkZW9DYXB0dXJlciA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9DYXB0dXJlcjtcbmNvbnN0IFBhcnRpY2lwYW50ID0gY29tLnR3aWxpby52aWRlby5SZW1vdGVQYXJ0aWNpcGFudDtcbmNvbnN0IFJvb20gPSBjb20udHdpbGlvLnZpZGVvLlJvb207XG5jb25zdCBWaWRlb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5WaWRlb1RyYWNrO1xuXG5leHBvcnQgY2xhc3MgVmlkZW9BY3Rpdml0eSB7XG5cbiAgICBwdWJsaWMgcHJldmlvdXNBdWRpb01vZGU6IGFueTtcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1ZpZXc6IGFueTtcbiAgICBwdWJsaWMgcmVtb3RlVmlkZW9WaWV3OiBhbnk7XG4gICAgcHVibGljIGxvY2FsVmlkZW9UcmFjazogYW55O1xuICAgIHB1YmxpYyBsb2NhbEF1ZGlvVHJhY2s6IGFueTtcbiAgICBwdWJsaWMgY2FtZXJhQ2FwdHVyZXI6IGFueTtcbiAgICBwdWJsaWMgY2FtZXJhQ2FwdHVyZXJDb21wYXQ6IGFueTtcbiAgICBwdWJsaWMgYWNjZXNzVG9rZW46IHN0cmluZztcbiAgICBwdWJsaWMgVFdJTElPX0FDQ0VTU19UT0tFTjogc3RyaW5nO1xuICAgIHB1YmxpYyByb29tOiBhbnk7XG4gICAgcHVibGljIHByZXZpb3VzTWljcm9waG9uZU11dGU6IGJvb2xlYW47XG4gICAgcHVibGljIGxvY2FsUGFydGljaXBhbnQ6IGFueTtcbiAgICBwdWJsaWMgYXVkaW9NYW5hZ2VyOiBhbnk7XG4gICAgcHJpdmF0ZSBfZXZlbnQ6IE9ic2VydmFibGU7XG4gICAgcHVibGljIHBhcnRpY2lwYW50OiBhbnk7XG5cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMuX2V2ZW50ID0gbmV3IE9ic2VydmFibGUoKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBVcGRhdGUgcHJlZmVycmVkIGF1ZGlvIGFuZCB2aWRlbyBjb2RlYyBpbiBjYXNlIGNoYW5nZWQgaW4gc2V0dGluZ3NcbiAgICAgICAgICovXG4gICAgICAgIC8vIHRoaXMuYXVkaW9Db2RlYyA9IGdldENvZGVjUHJlZmVyZW5jZShTZXR0aW5nc0FjdGl2aXR5LlBSRUZfQVVESU9fQ09ERUMsXG4gICAgICAgIC8vICAgICBTZXR0aW5nc0FjdGl2aXR5LlBSRUZfQVVESU9fQ09ERUNfREVGQVVMVCxcbiAgICAgICAgLy8gICAgIEF1ZGlvQ29kZWMuY2xhc3MpO1xuICAgICAgICAvLyB0aGlzLnZpZGVvQ29kZWMgPSBnZXRDb2RlY1ByZWZlcmVuY2UoU2V0dGluZ3NBY3Rpdml0eS5QUkVGX1ZJREVPX0NPREVDLFxuICAgICAgICAvLyAgICAgU2V0dGluZ3NBY3Rpdml0eS5QUkVGX1ZJREVPX0NPREVDX0RFRkFVTFQsXG4gICAgICAgIC8vICAgICBWaWRlb0NvZGVjLmNsYXNzKTsgICAgICAgIFxuXG4gICAgfVxuXG4gICAgZ2V0IGV2ZW50KCk6IE9ic2VydmFibGUge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudDtcblxuICAgIH1cblxuICAgIHB1YmxpYyBjb25uZWN0X3RvX3Jvb20ocm9vbU5hbWU6IHN0cmluZywgb3B0aW9uczogeyB2aWRlbzogYm9vbGVhbiwgYXVkaW86IGJvb2xlYW4gfSkge1xuXG4gICAgICAgIGlmICghdGhpcy5hY2Nlc3NUb2tlbikge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcy5hY2Nlc3NUb2tlbicpO1xuXG4gICAgICAgICAgICB0aGlzLm9uRXJyb3IoJ1BsZWFzZSBwcm92aWRlIGEgdmFsaWQgdG9rZW4gdG8gY29ubmVjdCB0byBhIHJvb20nKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH1cblxuXG4gICAgICAgIGxldCBjb25uZWN0T3B0aW9uc0J1aWxkZXIgPSBuZXcgQ29ubmVjdE9wdGlvbnMuQnVpbGRlcih0aGlzLmFjY2Vzc1Rva2VuKS5yb29tTmFtZShyb29tTmFtZSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmxvY2FsQXVkaW9UcmFjayAmJiBvcHRpb25zLmF1ZGlvKSB7XG5cblxuICAgICAgICAgICAgYXBwLmFuZHJvaWQuZm9yZWdyb3VuZEFjdGl2aXR5LnNldFZvbHVtZUNvbnRyb2xTdHJlYW0oQXVkaW9NYW5hZ2VyLlNUUkVBTV9WT0lDRV9DQUxMKTtcblxuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlciA9IGFwcC5hbmRyb2lkLmNvbnRleHQuZ2V0U3lzdGVtU2VydmljZShhbmRyb2lkLmNvbnRlbnQuQ29udGV4dC5BVURJT19TRVJWSUNFKTtcblxuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRTcGVha2VycGhvbmVPbih0cnVlKTtcblxuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZV9hdWRpbyh0cnVlKTtcblxuXG4gICAgICAgICAgICB0aGlzLmxvY2FsQXVkaW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uTG9jYWxBdWRpb1RyYWNrLmNyZWF0ZSh1dGlsc01vZHVsZS5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgdHJ1ZSwgXCJtaWNcIik7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAqIEFkZCBsb2NhbCBhdWRpbyB0cmFjayB0byBjb25uZWN0IG9wdGlvbnMgdG8gc2hhcmUgd2l0aCBwYXJ0aWNpcGFudHMuXG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndGhpcy5sb2NhbEF1ZGlvVHJhY2snKTtcblxuICAgICAgICAgICAgY29ubmVjdE9wdGlvbnNCdWlsZGVyLmF1ZGlvVHJhY2tzKGphdmEudXRpbC5Db2xsZWN0aW9ucy5zaW5nbGV0b25MaXN0KHRoaXMubG9jYWxBdWRpb1RyYWNrKSk7XG5cblxuXG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICAgKiBBZGQgbG9jYWwgdmlkZW8gdHJhY2sgdG8gY29ubmVjdCBvcHRpb25zIHRvIHNoYXJlIHdpdGggcGFydGljaXBhbnRzLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHRoaXMubG9jYWxWaWRlb1RyYWNrICYmIG9wdGlvbnMudmlkZW8pIHtcbiAgICAgICAgICAgIGNvbm5lY3RPcHRpb25zQnVpbGRlci52aWRlb1RyYWNrcyhqYXZhLnV0aWwuQ29sbGVjdGlvbnMuc2luZ2xldG9uTGlzdCh0aGlzLmxvY2FsVmlkZW9UcmFjaykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLypcbiAgICAgICAgICogU2V0IHRoZSBwcmVmZXJyZWQgYXVkaW8gYW5kIHZpZGVvIGNvZGVjIGZvciBtZWRpYS5cbiAgICAgICAgICovXG4gICAgICAgIC8vIGNvbm5lY3RPcHRpb25zQnVpbGRlci5wcmVmZXJBdWRpb0NvZGVjcyhqYXZhLnV0aWwuQ29sbGVjdGlvbnMuc2luZ2xldG9uTGlzdChhdWRpb0NvZGVjKSk7XG4gICAgICAgIC8vIGNvbm5lY3RPcHRpb25zQnVpbGRlci5wcmVmZXJWaWRlb0NvZGVjcyhqYXZhLnV0aWwuQ29sbGVjdGlvbnMuc2luZ2xldG9uTGlzdCh2aWRlb0NvZGVjKSk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogU2V0IHRoZSBzZW5kZXIgc2lkZSBlbmNvZGluZyBwYXJhbWV0ZXJzLlxuICAgICAgICAgKi9cbiAgICAgICAgLy8gY29ubmVjdE9wdGlvbnNCdWlsZGVyLmVuY29kaW5nUGFyYW1ldGVycyhlbmNvZGluZ1BhcmFtZXRlcnMpO1xuXG4gICAgICAgIC8vIHJvb20gPSBWaWRlby5jb25uZWN0KHRoaXMsIGNvbm5lY3RPcHRpb25zQnVpbGRlci5idWlsZCgpLCByb29tTGlzdGVuZXIoKSk7XG4gICAgICAgIC8vIHNldERpc2Nvbm5lY3RBY3Rpb24oKTsgICAgICAgIFxuXG4gICAgICAgIHRoaXMucm9vbSA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW8uY29ubmVjdCh1dGlsc01vZHVsZS5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgY29ubmVjdE9wdGlvbnNCdWlsZGVyLmJ1aWxkKCksIHRoaXMucm9vbUxpc3RlbmVyKCkpO1xuICAgIH1cblxuICAgIHN0YXJ0UHJldmlldygpOiBhbnkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjayAmJiB0aGlzLmxvY2FsVmlkZW9UcmFjayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9O1xuICAgICAgICAvLyB0aGlzLmNhbWVyYUNhcHR1cmVyID0gbmV3IENhbWVyYUNhcHR1cmVyKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCBDYW1lcmFDYXB0dXJlci5DYW1lcmFTb3VyY2UuRlJPTlRfQ0FNRVJBLCB0aGlzLmNhbWVyYUxpc3RlbmVyKCkpO1xuICAgICAgICB0aGlzLmNhbWVyYUNhcHR1cmVyID0gbmV3IENhbWVyYUNhcHR1cmVyKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCBDYW1lcmFDYXB0dXJlci5DYW1lcmFTb3VyY2UuRlJPTlRfQ0FNRVJBLCBudWxsKTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sgPSBMb2NhbFZpZGVvVHJhY2suY3JlYXRlKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlLCB0aGlzLmNhbWVyYUNhcHR1cmVyLCAnY2FtZXJhJyk7XG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLmFkZFJlbmRlcmVyKHRoaXMubG9jYWxWaWRlb1ZpZXcpO1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9WaWV3LnNldE1pcnJvcih0cnVlKTtcblxuICAgIH1cblxuXG5cbiAgICBwdWJsaWMgYWRkUmVtb3RlUGFydGljaXBhbnQocmVtb3RlUGFydGljaXBhbnQ6IGFueSkge1xuICAgICAgICBpZiAocmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICBsZXQgcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uID0gcmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5nZXQoMCk7XG4gICAgICAgICAgICBpZiAocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmlzVHJhY2tTdWJzY3JpYmVkKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFJlbW90ZVBhcnRpY2lwYW50VmlkZW8ocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmdldFJlbW90ZVZpZGVvVHJhY2soKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICAvKlxuICAgICAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIHBhcnRpY2lwYW50IGV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3RlUGFydGljaXBhbnQuc2V0TGlzdGVuZXIodGhpcy5wYXJ0aWNpcGFudExpc3RlbmVyKCkpO1xuXG4gICAgfVxuXG5cbiAgICBvbkVycm9yKHJlYXNvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICBldmVudE5hbWU6ICdlcnJvcicsXG4gICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIHJlYXNvbjogcmVhc29uXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyByZW1vdmVQYXJ0aWNpcGFudFZpZGVvKHZpZGVvVHJhY2spIHtcbiAgICAgICAgdmlkZW9UcmFjay5yZW1vdmVSZW5kZXJlcih0aGlzLnJlbW90ZVZpZGVvVmlldyk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZVJlbW90ZVBhcnRpY2lwYW50KHJlbW90ZVBhcnRpY2lwYW50KSB7XG5cbiAgICAgICAgLy8gaWYgKCFyZW1vdGVQYXJ0aWNpcGFudC5nZXRJZGVudGl0eSgpLmVxdWFscyhyZW1vdGVQYXJ0aWNpcGFudElkZW50aXR5KSkge1xuICAgICAgICAvLyAgICAgcmV0dXJuO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLypcbiAgICAgICAgKiBSZW1vdmUgcmVtb3RlIHBhcnRpY2lwYW50IHJlbmRlcmVyXG4gICAgICAgICovXG4gICAgICAgIGlmICghcmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgIGxldCByZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24gPSByZW1vdGVQYXJ0aWNpcGFudC5nZXRSZW1vdGVWaWRlb1RyYWNrcygpLmdldCgwKTtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAqIFJlbW92ZSB2aWRlbyBvbmx5IGlmIHN1YnNjcmliZWQgdG8gcGFydGljaXBhbnQgdHJhY2tcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmlzVHJhY2tTdWJzY3JpYmVkKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVBhcnRpY2lwYW50VmlkZW8ocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmdldFJlbW90ZVZpZGVvVHJhY2soKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qXG4gICAgICogU2V0IHByaW1hcnkgdmlldyBhcyByZW5kZXJlciBmb3IgcGFydGljaXBhbnQgdmlkZW8gdHJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkUmVtb3RlUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKSB7XG4gICAgICAgIHRoaXMucmVtb3RlVmlkZW9WaWV3LnNldE1pcnJvcih0cnVlKTtcbiAgICAgICAgdmlkZW9UcmFjay5hZGRSZW5kZXJlcih0aGlzLnJlbW90ZVZpZGVvVmlldyk7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3lfbG9jYWxfdmlkZW8oKSB7XG5cbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sucmVtb3ZlUmVuZGVyZXIodGhpcy5sb2NhbFZpZGVvVmlldyk7XG5cbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sgPSBudWxsXG5cbiAgICB9XG5cblxuICAgIGRpc2Nvbm5lY3QoKSB7XG5cbiAgICAgICAgdGhpcy5yb29tLmRpc2Nvbm5lY3QoKTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBjYW1lcmFMaXN0ZW5lcigpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgQ2FtZXJhQ2FwdHVyZXIuTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25GaXJzdEZyYW1lQXZhaWxhYmxlKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3ZpZGVvVmlld0RpZFJlY2VpdmVEYXRhJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXc6ICd2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uRXJyb3IoZSkge1xuICAgICAgICAgICAgICAgIHNlbGYub25FcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIHB1YmxpYyByb29tTGlzdGVuZXIoKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICByZXR1cm4gbmV3IFJvb20uTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25Db25uZWN0ZWQocm9vbSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSByb29tLmdldFJlbW90ZVBhcnRpY2lwYW50cygpO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5sb2NhbFBhcnRpY2lwYW50ID0gcm9vbS5nZXRMb2NhbFBhcnRpY2lwYW50KCk7XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdkaWRDb25uZWN0VG9Sb29tJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogbGlzdC5zaXplKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0LnNpemUoKTsgaSA8IGw7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNpcGFudCA9IGxpc3QuZ2V0KGkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0aWNpcGFudC5nZXRWaWRlb1RyYWNrcygpLnNpemUoKSA+IDApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25Db25uZWN0RmFpbHVyZShyb29tLCBlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmF1ZGlvTWFuYWdlcilcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb25maWd1cmVfYXVkaW8oZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ2RpZEZhaWxUb0Nvbm5lY3RXaXRoRXJyb3InLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25EaXNjb25uZWN0ZWQocm9vbSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJvb20gPSAnJztcbiAgICAgICAgICAgICAgICBzZWxmLmxvY2FsUGFydGljaXBhbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmF1ZGlvTWFuYWdlcilcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb25maWd1cmVfYXVkaW8oZmFsc2UpXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkRpc2Nvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblBhcnRpY2lwYW50Q29ubmVjdGVkKHJvb20sIHBhcnRpY2lwYW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnREaWRDb25uZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogcGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5zaXplKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFJlbW90ZVBhcnRpY2lwYW50KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblBhcnRpY2lwYW50RGlzY29ubmVjdGVkKHJvb20sIHBhcnRpY2lwYW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnREaWREaXNjb25uZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzZWxmLnJlbW92ZVJlbW90ZVBhcnRpY2lwYW50KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblJlY29yZGluZ1N0YXJ0ZWQocm9vbSkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICogSW5kaWNhdGVzIHdoZW4gbWVkaWEgc2hhcmVkIHRvIGEgUm9vbSBpcyBiZWluZyByZWNvcmRlZC4gTm90ZSB0aGF0XG4gICAgICAgICAgICAgICAgICogcmVjb3JkaW5nIGlzIG9ubHkgYXZhaWxhYmxlIGluIG91ciBHcm91cCBSb29tcyBkZXZlbG9wZXIgcHJldmlldy5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAvLyBpZiAoc2VsZi5fZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGV2ZW50TmFtZTogJ29uUmVjb3JkaW5nU3RhcnRlZCcsXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHJvb206IHJvb21cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLy8gICAgIH0pXG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUmVjb3JkaW5nU3RvcHBlZChyb29tKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgKHNlbGYuX2V2ZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBldmVudE5hbWU6ICdvblJlY29yZGluZ1N0b3BwZWQnLFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICByb29tOiByb29tXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRMaXN0ZW5lcigpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IFBhcnRpY2lwYW50Lkxpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQXVkaW9UcmFja1B1Ymxpc2hlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudFB1Ymxpc2hlZEF1ZGlvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tVbnB1Ymxpc2hlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudFVucHVibGlzaGVkQXVkaW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uVmlkZW9UcmFja1B1Ymxpc2hlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudFB1Ymxpc2hlZFZpZGVvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tVbnB1Ymxpc2hlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudFVucHVibGlzaGVkVmlkZW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQXVkaW9UcmFja1N1YnNjcmliZWQocmVtb3RlUGFydGljaXBhbnQsIHJlbW90ZUF1ZGlvVHJhY2tQdWJsaWNhdGlvbiwgcmVtb3RlQXVkaW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQXVkaW9UcmFja1N1YnNjcmliZWQnLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHJlbW90ZVBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHJlbW90ZUF1ZGlvVHJhY2tQdWJsaWNhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvVHJhY2s6IHJlbW90ZUF1ZGlvVHJhY2tcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BdWRpb1RyYWNrVW5zdWJzY3JpYmVkKHJlbW90ZVBhcnRpY2lwYW50LCByZW1vdGVBdWRpb1RyYWNrUHVibGljYXRpb24sIHJlbW90ZUF1ZGlvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkF1ZGlvVHJhY2tVbnN1YnNjcmliZWQnLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHJlbW90ZVBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHJlbW90ZUF1ZGlvVHJhY2tQdWJsaWNhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvVHJhY2s6IHJlbW90ZUF1ZGlvVHJhY2tcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrU3Vic2NyaWJlZChyZW1vdGVQYXJ0aWNpcGFudCwgcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLCByZW1vdGVWaWRlb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGRSZW1vdGVQYXJ0aWNpcGFudFZpZGVvKHJlbW90ZVZpZGVvVHJhY2spO1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uVmlkZW9UcmFja1N1YnNjcmliZWQnLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHJlbW90ZVBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvVHJhY2s6IHJlbW90ZVZpZGVvVHJhY2tcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uVmlkZW9UcmFja1Vuc3Vic2NyaWJlZChyZW1vdGVQYXJ0aWNpcGFudCwgcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLCByZW1vdGVWaWRlb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVQYXJ0aWNpcGFudFZpZGVvKHJlbW90ZVZpZGVvVHJhY2spO1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uVmlkZW9UcmFja1Vuc3Vic2NyaWJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcmVtb3RlUGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW9UcmFjazogcmVtb3RlVmlkZW9UcmFja1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uVmlkZW9UcmFja0Rpc2FibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlzYWJsZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tFbmFibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RW5hYmxlZFZpZGVvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uQXVkaW9UcmFja0Rpc2FibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlzYWJsZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tFbmFibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RW5hYmxlZEF1ZGlvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29uZmlndXJlX2F1ZGlvKGVuYWJsZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChlbmFibGUpIHtcblxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0F1ZGlvTW9kZSA9IHRoaXMuYXVkaW9NYW5hZ2VyLmdldE1vZGUoKTtcblxuICAgICAgICAgICAgLy8gUmVxdWVzdCBhdWRpbyBmb2N1cyBiZWZvcmUgbWFraW5nIGFueSBkZXZpY2Ugc3dpdGNoLlxuICAgICAgICAgICAgLy8gdGhpcy5hdWRpb01hbmFnZXIucmVxdWVzdEF1ZGlvRm9jdXMobnVsbCwgQXVkaW9NYW5hZ2VyLlNUUkVBTV9WT0lDRV9DQUxMLCBBdWRpb01hbmFnZXIuQVVESU9GT0NVU19HQUlOX1RSQU5TSUVOVCk7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RBdWRpb0ZvY3VzKCk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogVXNlIE1PREVfSU5fQ09NTVVOSUNBVElPTiBhcyB0aGUgZGVmYXVsdCBhdWRpbyBtb2RlLiBJdCBpcyByZXF1aXJlZFxuICAgICAgICAgICAgICogdG8gYmUgaW4gdGhpcyBtb2RlIHdoZW4gcGxheW91dCBhbmQvb3IgcmVjb3JkaW5nIHN0YXJ0cyBmb3IgdGhlIGJlc3RcbiAgICAgICAgICAgICAqIHBvc3NpYmxlIFZvSVAgcGVyZm9ybWFuY2UuIFNvbWUgZGV2aWNlcyBoYXZlIGRpZmZpY3VsdGllcyB3aXRoXG4gICAgICAgICAgICAgKiBzcGVha2VyIG1vZGUgaWYgdGhpcyBpcyBub3Qgc2V0LlxuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1vZGUoQXVkaW9NYW5hZ2VyLk1PREVfSU5fQ09NTVVOSUNBVElPTik7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBBbHdheXMgZGlzYWJsZSBtaWNyb3Bob25lIG11dGUgZHVyaW5nIGEgV2ViUlRDIGNhbGwuXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c01pY3JvcGhvbmVNdXRlID0gdGhpcy5hdWRpb01hbmFnZXIuaXNNaWNyb3Bob25lTXV0ZSgpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0TWljcm9waG9uZU11dGUoZmFsc2UpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1vZGUodGhpcy5wcmV2aW91c0F1ZGlvTW9kZSk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5hYmFuZG9uQXVkaW9Gb2N1cyhudWxsKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1pY3JvcGhvbmVNdXRlKHRoaXMucHJldmlvdXNNaWNyb3Bob25lTXV0ZSk7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZXF1ZXN0QXVkaW9Gb2N1cygpIHtcbiAgICAgICAgaWYgKGFuZHJvaWQub3MuQnVpbGQuVkVSU0lPTi5TREtfSU5UID49IDI1KSB7XG5cbiAgICAgICAgICAgIC8vIHZhciBwbGF5YmFja0F0dHJpYnV0ZXMgPSBuZXcgQXVkaW9BdHRyaWJ1dGVzLkJ1aWxkZXIoKVxuICAgICAgICAgICAgLy8gICAgIC5zZXRVc2FnZShBdWRpb0F0dHJpYnV0ZXMuVVNBR0VfVk9JQ0VfQ09NTVVOSUNBVElPTilcbiAgICAgICAgICAgIC8vICAgICAuc2V0Q29udGVudFR5cGUoQXVkaW9BdHRyaWJ1dGVzLkNPTlRFTlRfVFlQRV9TUEVFQ0gpXG4gICAgICAgICAgICAvLyAgICAgLmJ1aWxkKCk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMub25FcnJvcigncGxheWJhY2tBdHRyaWJ1dGVzJyk7XG5cbiAgICAgICAgICAgIC8vIHZhciBmb2N1c1JlcXVlc3QgPSBuZXcgQXVkaW9Gb2N1c1JlcXVlc3QuQnVpbGRlcihBdWRpb01hbmFnZXIuQVVESU9GT0NVU19HQUlOX1RSQU5TSUVOVClcbiAgICAgICAgICAgIC8vICAgICAuc2V0QXVkaW9BdHRyaWJ1dGVzKHBsYXliYWNrQXR0cmlidXRlcylcbiAgICAgICAgICAgIC8vICAgICAuc2V0QWNjZXB0c0RlbGF5ZWRGb2N1c0dhaW4odHJ1ZSlcbiAgICAgICAgICAgIC8vICAgICAuc2V0T25BdWRpb0ZvY3VzQ2hhbmdlTGlzdGVuZXIoXG4gICAgICAgICAgICAvLyAgICAgICAgIG5ldyBBdWRpb01hbmFnZXIuT25BdWRpb0ZvY3VzQ2hhbmdlTGlzdGVuZXIoe1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgb25BdWRpb0ZvY3VzQ2hhbmdlKGkpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vICAgICB9KS5idWlsZCgpKTtcblxuICAgICAgICAgICAgLy8gdGhpcy5vbkVycm9yKCdmb2N1c1JlcXVlc3QnKTtcblxuICAgICAgICAgICAgLy8gdGhpcy5hdWRpb01hbmFnZXIucmVxdWVzdEF1ZGlvRm9jdXMoZm9jdXNSZXF1ZXN0KTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIucmVxdWVzdEF1ZGlvRm9jdXMobnVsbCwgQXVkaW9NYW5hZ2VyLlNUUkVBTV9WT0lDRV9DQUxMLCBBdWRpb01hbmFnZXIuQVVESU9GT0NVU19HQUlOX1RSQU5TSUVOVCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0X2FjY2Vzc190b2tlbih0b2tlbjogc3RyaW5nKSB7XG5cbiAgICAgICAgdGhpcy5hY2Nlc3NUb2tlbiA9IHRva2VuO1xuXG4gICAgfVxuXG4gICAgcHVibGljIHRvZ2dsZV9sb2NhbF92aWRlbygpIHtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbFZpZGVvVHJhY2spIHtcblxuICAgICAgICAgICAgbGV0IGVuYWJsZSA9ICF0aGlzLmxvY2FsVmlkZW9UcmFjay5pc0VuYWJsZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2suZW5hYmxlKGVuYWJsZSk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcHVibGljIHRvZ2dsZV9sb2NhbF9hdWRpbygpIHtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbEF1ZGlvVHJhY2spIHtcblxuICAgICAgICAgICAgbGV0IGVuYWJsZWQgPSAhdGhpcy5sb2NhbEF1ZGlvVHJhY2suaXNFbmFibGVkKCk7XG5cbiAgICAgICAgICAgIHRoaXMubG9jYWxBdWRpb1RyYWNrLmVuYWJsZShlbmFibGVkKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbn0iXX0=
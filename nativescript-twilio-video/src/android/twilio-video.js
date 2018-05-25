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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdpbGlvLXZpZGVvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdpbGlvLXZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0RBQTBFO0FBQzFFLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUkxRCxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztBQUNoRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUN0RCxJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7QUFDMUQsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztBQUMzRCxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDN0MsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3JDLElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztBQUNyRCxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7QUFDekQsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQy9DLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztBQUV2RCxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7QUFDdkQsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLE1BQU0s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QyxDQUFDLENBQUM7WUFFdkIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRWhELElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpDLENBQUM7SUFFTCxDQUFDO0lBRUwsb0JBQUM7QUFBRCxDQUFDLEFBamlCRCxJQWlpQkM7QUFqaUJZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91dGlscy91dGlsc1wiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbU9iamVjdCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZGF0YS9vYnNlcnZhYmxlJztcbnZhciBhcHAgPSByZXF1aXJlKFwiYXBwbGljYXRpb25cIik7XG52YXIgdXRpbHNNb2R1bGUgPSByZXF1aXJlKFwidG5zLWNvcmUtbW9kdWxlcy91dGlscy91dGlsc1wiKTtcblxuZGVjbGFyZSB2YXIgY29tLCBhbmRyb2lkOiBhbnk7XG5cbmNvbnN0IEF1ZGlvTWFuYWdlciA9IGFuZHJvaWQubWVkaWEuQXVkaW9NYW5hZ2VyO1xuY29uc3QgQXVkaW9BdHRyaWJ1dGVzID0gYW5kcm9pZC5tZWRpYS5BdWRpb0F0dHJpYnV0ZXM7XG5jb25zdCBBdWRpb0ZvY3VzUmVxdWVzdCA9IGFuZHJvaWQubWVkaWEuQXVkaW9Gb2N1c1JlcXVlc3Q7XG5jb25zdCBMb2NhbFBhcnRpY2lwYW50ID0gY29tLnR3aWxpby52aWRlby5Mb2NhbFBhcnRpY2lwYW50O1xuY29uc3QgUm9vbVN0YXRlID0gY29tLnR3aWxpby52aWRlby5Sb29tU3RhdGU7XG5jb25zdCBWaWRlbyA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW87XG5jb25zdCBWaWRlb1JlbmRlcmVyID0gY29tLnR3aWxpby52aWRlby5WaWRlb1JlbmRlcmVyO1xuY29uc3QgVHdpbGlvRXhjZXB0aW9uID0gY29tLnR3aWxpby52aWRlby5Ud2lsaW9FeGNlcHRpb247XG5jb25zdCBBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5BdWRpb1RyYWNrO1xuY29uc3QgQ2FtZXJhQ2FwdHVyZXIgPSBjb20udHdpbGlvLnZpZGVvLkNhbWVyYUNhcHR1cmVyO1xuLy8gY29uc3QgQ2FtZXJhQ2FwdHVyZXJDYW1lcmFTb3VyY2UgPSBjb20udHdpbGlvLnZpZGVvLkNhbWVyYUNhcHR1cmVyLkNhbWVyYVNvdXJjZTtcbmNvbnN0IENvbm5lY3RPcHRpb25zID0gY29tLnR3aWxpby52aWRlby5Db25uZWN0T3B0aW9ucztcbmNvbnN0IExvY2FsQXVkaW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uTG9jYWxBdWRpb1RyYWNrO1xuY29uc3QgTG9jYWxWaWRlb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbFZpZGVvVHJhY2s7XG4vLyBjb25zdCBWaWRlb0NhcHR1cmVyID0gY29tLnR3aWxpby52aWRlby5WaWRlb0NhcHR1cmVyO1xuY29uc3QgUGFydGljaXBhbnQgPSBjb20udHdpbGlvLnZpZGVvLlJlbW90ZVBhcnRpY2lwYW50O1xuY29uc3QgUm9vbSA9IGNvbS50d2lsaW8udmlkZW8uUm9vbTtcbmNvbnN0IFZpZGVvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvVHJhY2s7XG5cbmV4cG9ydCBjbGFzcyBWaWRlb0FjdGl2aXR5IHtcblxuICAgIHB1YmxpYyBwcmV2aW91c0F1ZGlvTW9kZTogYW55O1xuICAgIHB1YmxpYyBsb2NhbFZpZGVvVmlldzogYW55O1xuICAgIHB1YmxpYyByZW1vdGVWaWRlb1ZpZXc6IGFueTtcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1RyYWNrOiBhbnk7XG4gICAgcHVibGljIGxvY2FsQXVkaW9UcmFjazogYW55O1xuICAgIHB1YmxpYyBjYW1lcmFDYXB0dXJlcjogYW55O1xuICAgIHB1YmxpYyBjYW1lcmFDYXB0dXJlckNvbXBhdDogYW55O1xuICAgIHB1YmxpYyBhY2Nlc3NUb2tlbjogc3RyaW5nO1xuICAgIHB1YmxpYyBUV0lMSU9fQUNDRVNTX1RPS0VOOiBzdHJpbmc7XG4gICAgcHVibGljIHJvb206IGFueTtcbiAgICBwdWJsaWMgcHJldmlvdXNNaWNyb3Bob25lTXV0ZTogYm9vbGVhbjtcbiAgICBwdWJsaWMgbG9jYWxQYXJ0aWNpcGFudDogYW55O1xuICAgIHB1YmxpYyBhdWRpb01hbmFnZXI6IGFueTtcbiAgICBwcml2YXRlIF9ldmVudDogT2JzZXJ2YWJsZTtcbiAgICBwdWJsaWMgcGFydGljaXBhbnQ6IGFueTtcblxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgdGhpcy5fZXZlbnQgPSBuZXcgT2JzZXJ2YWJsZSgpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIFVwZGF0ZSBwcmVmZXJyZWQgYXVkaW8gYW5kIHZpZGVvIGNvZGVjIGluIGNhc2UgY2hhbmdlZCBpbiBzZXR0aW5nc1xuICAgICAgICAgKi9cbiAgICAgICAgLy8gdGhpcy5hdWRpb0NvZGVjID0gZ2V0Q29kZWNQcmVmZXJlbmNlKFNldHRpbmdzQWN0aXZpdHkuUFJFRl9BVURJT19DT0RFQyxcbiAgICAgICAgLy8gICAgIFNldHRpbmdzQWN0aXZpdHkuUFJFRl9BVURJT19DT0RFQ19ERUZBVUxULFxuICAgICAgICAvLyAgICAgQXVkaW9Db2RlYy5jbGFzcyk7XG4gICAgICAgIC8vIHRoaXMudmlkZW9Db2RlYyA9IGdldENvZGVjUHJlZmVyZW5jZShTZXR0aW5nc0FjdGl2aXR5LlBSRUZfVklERU9fQ09ERUMsXG4gICAgICAgIC8vICAgICBTZXR0aW5nc0FjdGl2aXR5LlBSRUZfVklERU9fQ09ERUNfREVGQVVMVCxcbiAgICAgICAgLy8gICAgIFZpZGVvQ29kZWMuY2xhc3MpOyAgICAgICAgXG5cbiAgICB9XG5cbiAgICBnZXQgZXZlbnQoKTogT2JzZXJ2YWJsZSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50O1xuXG4gICAgfVxuXG4gICAgcHVibGljIGNvbm5lY3RfdG9fcm9vbShyb29tTmFtZTogc3RyaW5nLCBvcHRpb25zOiB7IHZpZGVvOiBib29sZWFuLCBhdWRpbzogYm9vbGVhbiB9KSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmFjY2Vzc1Rva2VuKSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzLmFjY2Vzc1Rva2VuJyk7XG5cbiAgICAgICAgICAgIHRoaXMub25FcnJvcignUGxlYXNlIHByb3ZpZGUgYSB2YWxpZCB0b2tlbiB0byBjb25uZWN0IHRvIGEgcm9vbScpO1xuXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgfVxuXG5cbiAgICAgICAgbGV0IGNvbm5lY3RPcHRpb25zQnVpbGRlciA9IG5ldyBDb25uZWN0T3B0aW9ucy5CdWlsZGVyKHRoaXMuYWNjZXNzVG9rZW4pLnJvb21OYW1lKHJvb21OYW1lKTtcblxuICAgICAgICBpZiAoIXRoaXMubG9jYWxBdWRpb1RyYWNrICYmIG9wdGlvbnMuYXVkaW8pIHtcblxuXG4gICAgICAgICAgICBhcHAuYW5kcm9pZC5mb3JlZ3JvdW5kQWN0aXZpdHkuc2V0Vm9sdW1lQ29udHJvbFN0cmVhbShBdWRpb01hbmFnZXIuU1RSRUFNX1ZPSUNFX0NBTEwpO1xuXG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyID0gYXBwLmFuZHJvaWQuY29udGV4dC5nZXRTeXN0ZW1TZXJ2aWNlKGFuZHJvaWQuY29udGVudC5Db250ZXh0LkFVRElPX1NFUlZJQ0UpO1xuXG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldFNwZWFrZXJwaG9uZU9uKHRydWUpO1xuXG5cbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJlX2F1ZGlvKHRydWUpO1xuXG5cbiAgICAgICAgICAgIHRoaXMubG9jYWxBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbEF1ZGlvVHJhY2suY3JlYXRlKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlLCBcIm1pY1wiKTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICogQWRkIGxvY2FsIGF1ZGlvIHRyYWNrIHRvIGNvbm5lY3Qgb3B0aW9ucyB0byBzaGFyZSB3aXRoIHBhcnRpY2lwYW50cy5cbiAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0aGlzLmxvY2FsQXVkaW9UcmFjaycpO1xuXG4gICAgICAgICAgICBjb25uZWN0T3B0aW9uc0J1aWxkZXIuYXVkaW9UcmFja3MoamF2YS51dGlsLkNvbGxlY3Rpb25zLnNpbmdsZXRvbkxpc3QodGhpcy5sb2NhbEF1ZGlvVHJhY2spKTtcblxuICAgICAgICAgICAgXG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEFkZCBsb2NhbCB2aWRlbyB0cmFjayB0byBjb25uZWN0IG9wdGlvbnMgdG8gc2hhcmUgd2l0aCBwYXJ0aWNpcGFudHMuXG4gICAgICAgICAqL1xuXG4gICAgICAgIGlmICghdGhpcy5sb2NhbFZpZGVvVHJhY2sgJiYgb3B0aW9ucy52aWRlbykge1xuICAgICAgICAgICAgY29ubmVjdE9wdGlvbnNCdWlsZGVyLnZpZGVvVHJhY2tzKGphdmEudXRpbC5Db2xsZWN0aW9ucy5zaW5nbGV0b25MaXN0KHRoaXMubG9jYWxWaWRlb1RyYWNrKSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIFNldCB0aGUgcHJlZmVycmVkIGF1ZGlvIGFuZCB2aWRlbyBjb2RlYyBmb3IgbWVkaWEuXG4gICAgICAgICAqL1xuICAgICAgICAvLyBjb25uZWN0T3B0aW9uc0J1aWxkZXIucHJlZmVyQXVkaW9Db2RlY3MoamF2YS51dGlsLkNvbGxlY3Rpb25zLnNpbmdsZXRvbkxpc3QoYXVkaW9Db2RlYykpO1xuICAgICAgICAvLyBjb25uZWN0T3B0aW9uc0J1aWxkZXIucHJlZmVyVmlkZW9Db2RlY3MoamF2YS51dGlsLkNvbGxlY3Rpb25zLnNpbmdsZXRvbkxpc3QodmlkZW9Db2RlYykpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIFNldCB0aGUgc2VuZGVyIHNpZGUgZW5jb2RpbmcgcGFyYW1ldGVycy5cbiAgICAgICAgICovXG4gICAgICAgIC8vIGNvbm5lY3RPcHRpb25zQnVpbGRlci5lbmNvZGluZ1BhcmFtZXRlcnMoZW5jb2RpbmdQYXJhbWV0ZXJzKTtcblxuICAgICAgICAvLyByb29tID0gVmlkZW8uY29ubmVjdCh0aGlzLCBjb25uZWN0T3B0aW9uc0J1aWxkZXIuYnVpbGQoKSwgcm9vbUxpc3RlbmVyKCkpO1xuICAgICAgICAvLyBzZXREaXNjb25uZWN0QWN0aW9uKCk7ICAgICAgICBcblxuICAgICAgICB0aGlzLnJvb20gPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvLmNvbm5lY3QodXRpbHNNb2R1bGUuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCksIGNvbm5lY3RPcHRpb25zQnVpbGRlci5idWlsZCgpLCB0aGlzLnJvb21MaXN0ZW5lcigpKTtcbiAgICB9XG5cbiAgICBzdGFydFByZXZpZXcoKTogYW55IHtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbFZpZGVvVHJhY2sgJiYgdGhpcy5sb2NhbFZpZGVvVHJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gdGhpcy5jYW1lcmFDYXB0dXJlciA9IG5ldyBDYW1lcmFDYXB0dXJlcih1dGlsc01vZHVsZS5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlLkZST05UX0NBTUVSQSwgdGhpcy5jYW1lcmFMaXN0ZW5lcigpKTtcbiAgICAgICAgdGhpcy5jYW1lcmFDYXB0dXJlciA9IG5ldyBDYW1lcmFDYXB0dXJlcih1dGlsc01vZHVsZS5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlLkZST05UX0NBTUVSQSwgbnVsbCk7XG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gTG9jYWxWaWRlb1RyYWNrLmNyZWF0ZSh1dGlsc01vZHVsZS5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgdHJ1ZSwgdGhpcy5jYW1lcmFDYXB0dXJlciwgJ2NhbWVyYScpO1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5hZGRSZW5kZXJlcih0aGlzLmxvY2FsVmlkZW9WaWV3KTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVmlldy5zZXRNaXJyb3IodHJ1ZSk7XG5cbiAgICB9XG5cblxuXG4gICAgcHVibGljIGFkZFJlbW90ZVBhcnRpY2lwYW50KHJlbW90ZVBhcnRpY2lwYW50OiBhbnkpIHtcbiAgICAgICAgaWYgKHJlbW90ZVBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgbGV0IHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbiA9IHJlbW90ZVBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuZ2V0KDApO1xuICAgICAgICAgICAgaWYgKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5pc1RyYWNrU3Vic2NyaWJlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRSZW1vdGVQYXJ0aWNpcGFudFZpZGVvKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5nZXRSZW1vdGVWaWRlb1RyYWNrKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgLypcbiAgICAgICAgICogU3RhcnQgbGlzdGVuaW5nIGZvciBwYXJ0aWNpcGFudCBldmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHJlbW90ZVBhcnRpY2lwYW50LnNldExpc3RlbmVyKHRoaXMucGFydGljaXBhbnRMaXN0ZW5lcigpKTtcblxuICAgIH1cblxuXG4gICAgb25FcnJvcihyZWFzb246IHN0cmluZykge1xuICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgZXZlbnROYW1lOiAnZXJyb3InLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICByZWFzb246IHJlYXNvblxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVtb3ZlUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKSB7XG4gICAgICAgIHZpZGVvVHJhY2sucmVtb3ZlUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVSZW1vdGVQYXJ0aWNpcGFudChyZW1vdGVQYXJ0aWNpcGFudCkge1xuXG4gICAgICAgIC8vIGlmICghcmVtb3RlUGFydGljaXBhbnQuZ2V0SWRlbnRpdHkoKS5lcXVhbHMocmVtb3RlUGFydGljaXBhbnRJZGVudGl0eSkpIHtcbiAgICAgICAgLy8gICAgIHJldHVybjtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8qXG4gICAgICAgICogUmVtb3ZlIHJlbW90ZSBwYXJ0aWNpcGFudCByZW5kZXJlclxuICAgICAgICAqL1xuICAgICAgICBpZiAoIXJlbW90ZVBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICBsZXQgcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uID0gcmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5nZXQoMCk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgKiBSZW1vdmUgdmlkZW8gb25seSBpZiBzdWJzY3JpYmVkIHRvIHBhcnRpY2lwYW50IHRyYWNrXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5pc1RyYWNrU3Vic2NyaWJlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQYXJ0aWNpcGFudFZpZGVvKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5nZXRSZW1vdGVWaWRlb1RyYWNrKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFNldCBwcmltYXJ5IHZpZXcgYXMgcmVuZGVyZXIgZm9yIHBhcnRpY2lwYW50IHZpZGVvIHRyYWNrXG4gICAgICovXG4gICAgcHVibGljIGFkZFJlbW90ZVBhcnRpY2lwYW50VmlkZW8odmlkZW9UcmFjaykge1xuICAgICAgICB0aGlzLnJlbW90ZVZpZGVvVmlldy5zZXRNaXJyb3IodHJ1ZSk7XG4gICAgICAgIHZpZGVvVHJhY2suYWRkUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95X2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLnJlbW92ZVJlbmRlcmVyKHRoaXMubG9jYWxWaWRlb1ZpZXcpO1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gbnVsbFxuXG4gICAgfVxuXG5cbiAgICBkaXNjb25uZWN0KCkge1xuXG4gICAgICAgIHRoaXMucm9vbS5kaXNjb25uZWN0KCk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY2FtZXJhTGlzdGVuZXIoKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IENhbWVyYUNhcHR1cmVyLkxpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uRmlyc3RGcmFtZUF2YWlsYWJsZSgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICd2aWRlb1ZpZXdEaWRSZWNlaXZlRGF0YScsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3OiAndmlldycsXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkVycm9yKGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9uRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcm9vbUxpc3RlbmVyKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBSb29tLkxpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQ29ubmVjdGVkKHJvb20pIHtcblxuICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gcm9vbS5nZXRSZW1vdGVQYXJ0aWNpcGFudHMoKTtcblxuICAgICAgICAgICAgICAgIHNlbGYubG9jYWxQYXJ0aWNpcGFudCA9IHJvb20uZ2V0TG9jYWxQYXJ0aWNpcGFudCgpO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnZGlkQ29ubmVjdFRvUm9vbScsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGxpc3Quc2l6ZSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5zaXplKCk7IGkgPCBsOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFydGljaXBhbnQgPSBsaXN0LmdldChpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocGFydGljaXBhbnQuZ2V0VmlkZW9UcmFja3MoKS5zaXplKCkgPiAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWRkUmVtb3RlUGFydGljaXBhbnQocGFydGljaXBhbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ29ubmVjdEZhaWx1cmUocm9vbSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5hdWRpb01hbmFnZXIpXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY29uZmlndXJlX2F1ZGlvKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdkaWRGYWlsVG9Db25uZWN0V2l0aEVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uRGlzY29ubmVjdGVkKHJvb20sIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yb29tID0gJyc7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2NhbFBhcnRpY2lwYW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5hdWRpb01hbmFnZXIpXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY29uZmlndXJlX2F1ZGlvKGZhbHNlKVxuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25EaXNjb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25QYXJ0aWNpcGFudENvbm5lY3RlZChyb29tLCBwYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlkQ29ubmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuc2l6ZSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGRSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25QYXJ0aWNpcGFudERpc2Nvbm5lY3RlZChyb29tLCBwYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlkRGlzY29ubmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZWNvcmRpbmdTdGFydGVkKHJvb20pIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIEluZGljYXRlcyB3aGVuIG1lZGlhIHNoYXJlZCB0byBhIFJvb20gaXMgYmVpbmcgcmVjb3JkZWQuIE5vdGUgdGhhdFxuICAgICAgICAgICAgICAgICAqIHJlY29yZGluZyBpcyBvbmx5IGF2YWlsYWJsZSBpbiBvdXIgR3JvdXAgUm9vbXMgZGV2ZWxvcGVyIHByZXZpZXcuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgLy8gaWYgKHNlbGYuX2V2ZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBldmVudE5hbWU6ICdvblJlY29yZGluZ1N0YXJ0ZWQnLFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICByb29tOiByb29tXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblJlY29yZGluZ1N0b3BwZWQocm9vbSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIChzZWxmLl9ldmVudCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgZXZlbnROYW1lOiAnb25SZWNvcmRpbmdTdG9wcGVkJyxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgcm9vbTogcm9vbVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHBhcnRpY2lwYW50TGlzdGVuZXIoKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyBQYXJ0aWNpcGFudC5MaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tQdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRQdWJsaXNoZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BdWRpb1RyYWNrVW5wdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRVbnB1Ymxpc2hlZEF1ZGlvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tQdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRQdWJsaXNoZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrVW5wdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRVbnB1Ymxpc2hlZFZpZGVvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tTdWJzY3JpYmVkKHJlbW90ZVBhcnRpY2lwYW50LCByZW1vdGVBdWRpb1RyYWNrUHVibGljYXRpb24sIHJlbW90ZUF1ZGlvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkF1ZGlvVHJhY2tTdWJzY3JpYmVkJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiByZW1vdGVQYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiByZW1vdGVBdWRpb1RyYWNrUHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBhdWRpb1RyYWNrOiByZW1vdGVBdWRpb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQXVkaW9UcmFja1Vuc3Vic2NyaWJlZChyZW1vdGVQYXJ0aWNpcGFudCwgcmVtb3RlQXVkaW9UcmFja1B1YmxpY2F0aW9uLCByZW1vdGVBdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25BdWRpb1RyYWNrVW5zdWJzY3JpYmVkJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiByZW1vdGVQYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiByZW1vdGVBdWRpb1RyYWNrUHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBhdWRpb1RyYWNrOiByZW1vdGVBdWRpb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uVmlkZW9UcmFja1N1YnNjcmliZWQocmVtb3RlUGFydGljaXBhbnQsIHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbiwgcmVtb3RlVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHNlbGYuYWRkUmVtb3RlUGFydGljaXBhbnRWaWRlbyhyZW1vdGVWaWRlb1RyYWNrKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tTdWJzY3JpYmVkJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiByZW1vdGVQYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiByZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWRlb1RyYWNrOiByZW1vdGVWaWRlb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tVbnN1YnNjcmliZWQocmVtb3RlUGFydGljaXBhbnQsIHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbiwgcmVtb3RlVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlUGFydGljaXBhbnRWaWRlbyhyZW1vdGVWaWRlb1RyYWNrKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tVbnN1YnNjcmliZWQnLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHJlbW90ZVBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvVHJhY2s6IHJlbW90ZVZpZGVvVHJhY2tcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tEaXNhYmxlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudERpc2FibGVkVmlkZW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25WaWRlb1RyYWNrRW5hYmxlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudEVuYWJsZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tEaXNhYmxlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudERpc2FibGVkQXVkaW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25BdWRpb1RyYWNrRW5hYmxlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudEVuYWJsZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbmZpZ3VyZV9hdWRpbyhlbmFibGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZW5hYmxlKSB7XG5cbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNBdWRpb01vZGUgPSB0aGlzLmF1ZGlvTWFuYWdlci5nZXRNb2RlKCk7XG5cbiAgICAgICAgICAgIC8vIFJlcXVlc3QgYXVkaW8gZm9jdXMgYmVmb3JlIG1ha2luZyBhbnkgZGV2aWNlIHN3aXRjaC5cbiAgICAgICAgICAgIC8vIHRoaXMuYXVkaW9NYW5hZ2VyLnJlcXVlc3RBdWRpb0ZvY3VzKG51bGwsIEF1ZGlvTWFuYWdlci5TVFJFQU1fVk9JQ0VfQ0FMTCwgQXVkaW9NYW5hZ2VyLkFVRElPRk9DVVNfR0FJTl9UUkFOU0lFTlQpO1xuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0QXVkaW9Gb2N1cygpO1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIFVzZSBNT0RFX0lOX0NPTU1VTklDQVRJT04gYXMgdGhlIGRlZmF1bHQgYXVkaW8gbW9kZS4gSXQgaXMgcmVxdWlyZWRcbiAgICAgICAgICAgICAqIHRvIGJlIGluIHRoaXMgbW9kZSB3aGVuIHBsYXlvdXQgYW5kL29yIHJlY29yZGluZyBzdGFydHMgZm9yIHRoZSBiZXN0XG4gICAgICAgICAgICAgKiBwb3NzaWJsZSBWb0lQIHBlcmZvcm1hbmNlLiBTb21lIGRldmljZXMgaGF2ZSBkaWZmaWN1bHRpZXMgd2l0aFxuICAgICAgICAgICAgICogc3BlYWtlciBtb2RlIGlmIHRoaXMgaXMgbm90IHNldC5cbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNb2RlKEF1ZGlvTWFuYWdlci5NT0RFX0lOX0NPTU1VTklDQVRJT04pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogQWx3YXlzIGRpc2FibGUgbWljcm9waG9uZSBtdXRlIGR1cmluZyBhIFdlYlJUQyBjYWxsLlxuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNNaWNyb3Bob25lTXV0ZSA9IHRoaXMuYXVkaW9NYW5hZ2VyLmlzTWljcm9waG9uZU11dGUoKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1pY3JvcGhvbmVNdXRlKGZhbHNlKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNb2RlKHRoaXMucHJldmlvdXNBdWRpb01vZGUpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuYWJhbmRvbkF1ZGlvRm9jdXMobnVsbCk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNaWNyb3Bob25lTXV0ZSh0aGlzLnByZXZpb3VzTWljcm9waG9uZU11dGUpO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVxdWVzdEF1ZGlvRm9jdXMoKSB7XG4gICAgICAgIGlmIChhbmRyb2lkLm9zLkJ1aWxkLlZFUlNJT04uU0RLX0lOVCA+PSAyNSkge1xuXG4gICAgICAgICAgICAvLyB2YXIgcGxheWJhY2tBdHRyaWJ1dGVzID0gbmV3IEF1ZGlvQXR0cmlidXRlcy5CdWlsZGVyKClcbiAgICAgICAgICAgIC8vICAgICAuc2V0VXNhZ2UoQXVkaW9BdHRyaWJ1dGVzLlVTQUdFX1ZPSUNFX0NPTU1VTklDQVRJT04pXG4gICAgICAgICAgICAvLyAgICAgLnNldENvbnRlbnRUeXBlKEF1ZGlvQXR0cmlidXRlcy5DT05URU5UX1RZUEVfU1BFRUNIKVxuICAgICAgICAgICAgLy8gICAgIC5idWlsZCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyB0aGlzLm9uRXJyb3IoJ3BsYXliYWNrQXR0cmlidXRlcycpO1xuXG4gICAgICAgICAgICAvLyB2YXIgZm9jdXNSZXF1ZXN0ID0gbmV3IEF1ZGlvRm9jdXNSZXF1ZXN0LkJ1aWxkZXIoQXVkaW9NYW5hZ2VyLkFVRElPRk9DVVNfR0FJTl9UUkFOU0lFTlQpXG4gICAgICAgICAgICAvLyAgICAgLnNldEF1ZGlvQXR0cmlidXRlcyhwbGF5YmFja0F0dHJpYnV0ZXMpXG4gICAgICAgICAgICAvLyAgICAgLnNldEFjY2VwdHNEZWxheWVkRm9jdXNHYWluKHRydWUpXG4gICAgICAgICAgICAvLyAgICAgLnNldE9uQXVkaW9Gb2N1c0NoYW5nZUxpc3RlbmVyKFxuICAgICAgICAgICAgLy8gICAgICAgICBuZXcgQXVkaW9NYW5hZ2VyLk9uQXVkaW9Gb2N1c0NoYW5nZUxpc3RlbmVyKHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIG9uQXVkaW9Gb2N1c0NoYW5nZShpKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAgICAgfSkuYnVpbGQoKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHRoaXMub25FcnJvcignZm9jdXNSZXF1ZXN0Jyk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMuYXVkaW9NYW5hZ2VyLnJlcXVlc3RBdWRpb0ZvY3VzKGZvY3VzUmVxdWVzdCk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnJlcXVlc3RBdWRpb0ZvY3VzKG51bGwsIEF1ZGlvTWFuYWdlci5TVFJFQU1fVk9JQ0VfQ0FMTCwgQXVkaW9NYW5hZ2VyLkFVRElPRk9DVVNfR0FJTl9UUkFOU0lFTlQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldF9hY2Nlc3NfdG9rZW4odG9rZW46IHN0cmluZykge1xuXG4gICAgICAgIHRoaXMuYWNjZXNzVG9rZW4gPSB0b2tlbjtcblxuICAgIH1cblxuICAgIHB1YmxpYyB0b2dnbGVfbG9jYWxfdmlkZW8oKSB7XG5cbiAgICAgICAgaWYgKHRoaXMubG9jYWxWaWRlb1RyYWNrKSB7XG5cbiAgICAgICAgICAgIGxldCBlbmFibGUgPSAhdGhpcy5sb2NhbFZpZGVvVHJhY2suaXNFbmFibGVkKCk7XG5cbiAgICAgICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLmVuYWJsZShlbmFibGUpO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHB1YmxpYyB0b2dnbGVfbG9jYWxfYXVkaW8oKSB7XG5cbiAgICAgICAgaWYgKHRoaXMubG9jYWxBdWRpb1RyYWNrKSB7XG5cbiAgICAgICAgICAgIGxldCBlbmFibGVkID0gIXRoaXMubG9jYWxBdWRpb1RyYWNrLmlzRW5hYmxlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLmxvY2FsQXVkaW9UcmFjay5lbmFibGUoZW5hYmxlZCk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG59Il19
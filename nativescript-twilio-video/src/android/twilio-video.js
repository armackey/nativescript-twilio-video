"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("tns-core-modules/utils/utils");
var observable_1 = require("tns-core-modules/data/observable");
var application = require("tns-core-modules/application");
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
var ConnectOptions = com.twilio.video.ConnectOptions;
var LocalAudioTrack = com.twilio.video.LocalAudioTrack;
var LocalVideoTrack = com.twilio.video.LocalVideoTrack;
var Participant = com.twilio.video.RemoteParticipant;
var Room = com.twilio.video.Room;
var VideoTrack = com.twilio.video.VideoTrack;
var VideoActivity = (function () {
    function VideoActivity() {
        var _this = this;
        this.LOCAL_VIDEO_TRACK_NAME = 'camera';
        this.audioManager = app.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
        this._event = new observable_1.Observable();
        application.on('suspend', function () {
            if (_this.localVideoTrack && _this.localVideoTrack !== null) {
                if (_this.localParticipant) {
                    _this.localParticipant.unpublishTrack(_this.localVideoTrack);
                }
                _this.localVideoTrack.release();
                _this.localVideoTrack = null;
            }
        });
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
        remoteParticipant.setListener(this.participantListener());
    };
    VideoActivity.prototype.prepareLocalMedia = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.localAudioTrack) {
                _this.localAudioTrack = LocalAudioTrack.create(utils.ad.getApplicationContext(), true);
                if (!_this.localAudioTrack) {
                    _this.onError("Failed to add audio track");
                    reject("Failed to add audio track");
                    return;
                }
            }
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
        if (!remoteParticipant.getRemoteVideoTracks().isEmpty()) {
            var remoteVideoTrackPublication = remoteParticipant.getRemoteVideoTracks().get(0);
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
            connectOptionsBuilder.audioTracks(java.util.Collections.singletonList(this.localAudioTrack));
        }
        if (this.localVideoTrack) {
            connectOptionsBuilder.videoTracks(java.util.Collections.singletonList(this.localVideoTrack));
        }
        this.room = Video.connect(utils.ad.getApplicationContext(), connectOptionsBuilder.build(), this.roomListener());
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
                console.log("didConnectToRoom");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdpbGlvLXZpZGVvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdpbGlvLXZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esb0RBQXNEO0FBR3RELCtEQUEwRTtBQUUxRSwwREFBNEQ7QUFFNUQsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBSWpDLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO0FBQ2hELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO0FBQ3RELElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztBQUMxRCxJQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDO0FBQzNELElBQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUM3QyxJQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDckMsSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDO0FBQ3JELElBQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUN6RCxJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7QUFDL0MsSUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDO0FBRXZELElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztBQUN2RCxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENB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LE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFL0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFeEMsQ0FBQztJQUVMLENBQUM7SUF5Qk0sMENBQWtCLEdBQXpCO1FBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFFdkIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRWhELElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpDLENBQUM7SUFFTCxDQUFDO0lBRUwsb0JBQUM7QUFBRCxDQUFDLEFBMWtCRCxJQTBrQkM7QUExa0JZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91dGlscy91dGlsc1wiO1xuaW1wb3J0IHsgUmVtb3RlVmlkZW8gfSBmcm9tIFwiLi9yZW1vdGVWaWRlb1wiO1xuaW1wb3J0IHsgTG9jYWxWaWRlbyB9IGZyb20gXCIuL2xvY2FsVmlkZW9cIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb21PYmplY3QgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2RhdGEvb2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBWaWRlb0FjdGl2aXR5QmFzZSB9IGZyb20gXCIuLi90d2lsaW8tY29tbW9uXCI7XG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvblwiO1xuXG52YXIgYXBwID0gcmVxdWlyZShcImFwcGxpY2F0aW9uXCIpO1xuXG5kZWNsYXJlIHZhciBjb20sIGFuZHJvaWQ6IGFueTtcblxuY29uc3QgQXVkaW9NYW5hZ2VyID0gYW5kcm9pZC5tZWRpYS5BdWRpb01hbmFnZXI7XG5jb25zdCBBdWRpb0F0dHJpYnV0ZXMgPSBhbmRyb2lkLm1lZGlhLkF1ZGlvQXR0cmlidXRlcztcbmNvbnN0IEF1ZGlvRm9jdXNSZXF1ZXN0ID0gYW5kcm9pZC5tZWRpYS5BdWRpb0ZvY3VzUmVxdWVzdDtcbmNvbnN0IExvY2FsUGFydGljaXBhbnQgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsUGFydGljaXBhbnQ7XG5jb25zdCBSb29tU3RhdGUgPSBjb20udHdpbGlvLnZpZGVvLlJvb21TdGF0ZTtcbmNvbnN0IFZpZGVvID0gY29tLnR3aWxpby52aWRlby5WaWRlbztcbmNvbnN0IFZpZGVvUmVuZGVyZXIgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvUmVuZGVyZXI7XG5jb25zdCBUd2lsaW9FeGNlcHRpb24gPSBjb20udHdpbGlvLnZpZGVvLlR3aWxpb0V4Y2VwdGlvbjtcbmNvbnN0IEF1ZGlvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkF1ZGlvVHJhY2s7XG5jb25zdCBDYW1lcmFDYXB0dXJlciA9IGNvbS50d2lsaW8udmlkZW8uQ2FtZXJhQ2FwdHVyZXI7XG4vLyBjb25zdCBDYW1lcmFDYXB0dXJlckNhbWVyYVNvdXJjZSA9IGNvbS50d2lsaW8udmlkZW8uQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlO1xuY29uc3QgQ29ubmVjdE9wdGlvbnMgPSBjb20udHdpbGlvLnZpZGVvLkNvbm5lY3RPcHRpb25zO1xuY29uc3QgTG9jYWxBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbEF1ZGlvVHJhY2s7XG5jb25zdCBMb2NhbFZpZGVvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsVmlkZW9UcmFjaztcbi8vIGNvbnN0IFZpZGVvQ2FwdHVyZXIgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvQ2FwdHVyZXI7XG5jb25zdCBQYXJ0aWNpcGFudCA9IGNvbS50d2lsaW8udmlkZW8uUmVtb3RlUGFydGljaXBhbnQ7XG5jb25zdCBSb29tID0gY29tLnR3aWxpby52aWRlby5Sb29tO1xuY29uc3QgVmlkZW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9UcmFjaztcbi8vIGNvbnN0IENhbWVyYUNhcHR1cmVyQ29tcGF0ID0gY29tLnR3aWxpby52aWRlby51dGlsLkNhbWVyYUNhcHR1cmVyQ29tcGF0O1xuXG5leHBvcnQgY2xhc3MgVmlkZW9BY3Rpdml0eSB7XG5cbiAgICBwdWJsaWMgcHJldmlvdXNBdWRpb01vZGU6IGFueTtcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1ZpZXc6IGFueTtcbiAgICBwdWJsaWMgcmVtb3RlVmlkZW9WaWV3OiBhbnk7XG4gICAgcHVibGljIGxvY2FsVmlkZW9UcmFjazogYW55O1xuICAgIHB1YmxpYyBsb2NhbEF1ZGlvVHJhY2s6IGFueTtcbiAgICBwdWJsaWMgY2FtZXJhQ2FwdHVyZXI6IGFueTtcbiAgICBwdWJsaWMgY2FtZXJhQ2FwdHVyZXJDb21wYXQ6IGFueTtcbiAgICBwdWJsaWMgYWNjZXNzVG9rZW46IHN0cmluZztcbiAgICBwdWJsaWMgVFdJTElPX0FDQ0VTU19UT0tFTjogc3RyaW5nO1xuICAgIHB1YmxpYyByb29tOiBhbnk7XG4gICAgcHVibGljIHByZXZpb3VzTWljcm9waG9uZU11dGU6IGJvb2xlYW47XG4gICAgcHVibGljIGxvY2FsUGFydGljaXBhbnQ6IGFueTtcbiAgICBwdWJsaWMgYXVkaW9NYW5hZ2VyOiBhbnk7XG4gICAgcHJpdmF0ZSBfZXZlbnQ6IE9ic2VydmFibGU7XG4gICAgcHJpdmF0ZSBfcm9vbUxpc3RlbmVyOiBhbnk7XG4gICAgcHJpdmF0ZSBfcGFydGljaXBhbnRMaXN0ZW5lcjogYW55O1xuICAgIHB1YmxpYyBwYXJ0aWNpcGFudDogYW55O1xuICAgIExPQ0FMX1ZJREVPX1RSQUNLX05BTUU6IHN0cmluZyA9ICdjYW1lcmEnO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyID0gYXBwLmFuZHJvaWQuY29udGV4dC5nZXRTeXN0ZW1TZXJ2aWNlKGFuZHJvaWQuY29udGVudC5Db250ZXh0LkFVRElPX1NFUlZJQ0UpO1xuICAgICAgICB0aGlzLl9ldmVudCA9IG5ldyBPYnNlcnZhYmxlKCk7XG4gICAgICAgIC8vIHNldFZvbHVtZUNvbnRyb2xTdHJlYW0oQXVkaW9NYW5hZ2VyLlNUUkVBTV9WT0lDRV9DQUxMKTtcblxuICAgICAgICBhcHBsaWNhdGlvbi5vbignc3VzcGVuZCcsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjayAmJiB0aGlzLmxvY2FsVmlkZW9UcmFjayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICogSWYgdGhpcyBsb2NhbCB2aWRlbyB0cmFjayBpcyBiZWluZyBzaGFyZWQgaW4gYSBSb29tLCB1bnB1Ymxpc2ggZnJvbSByb29tIGJlZm9yZVxuICAgICAgICAgICAgICAgICAqIHJlbGVhc2luZyB0aGUgdmlkZW8gdHJhY2suIFBhcnRpY2lwYW50cyB3aWxsIGJlIG5vdGlmaWVkIHRoYXQgdGhlIHRyYWNrIGhhcyBiZWVuXG4gICAgICAgICAgICAgICAgICogdW5wdWJsaXNoZWQuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxQYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2FsUGFydGljaXBhbnQudW5wdWJsaXNoVHJhY2sodGhpcy5sb2NhbFZpZGVvVHJhY2spO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLnJlbGVhc2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjayA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgZ2V0IGV2ZW50KCk6IE9ic2VydmFibGUge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudDtcblxuICAgIH1cblxuICAgIHN0YXJ0UHJldmlldygpOiBQcm9taXNlPGFueT4ge1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxWaWRlb1RyYWNrICYmIHRoaXMubG9jYWxWaWRlb1RyYWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubG9jYWxWaWRlb1ZpZXcuc2V0TWlycm9yKHRydWUpO1xuICAgICAgICAgICAgLy8gdGhpcy5jYW1lcmFDYXB0dXJlciA9IG5ldyBDYW1lcmFDYXB0dXJlcih1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlLkZST05UX0NBTUVSQSwgdGhpcy5jYW1lcmFMaXN0ZW5lcigpKTtcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhQ2FwdHVyZXIgPSBuZXcgQ2FtZXJhQ2FwdHVyZXIodXRpbHMuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCksIENhbWVyYUNhcHR1cmVyLkNhbWVyYVNvdXJjZS5GUk9OVF9DQU1FUkEsIG51bGwpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sgPSBMb2NhbFZpZGVvVHJhY2suY3JlYXRlKHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlLCB0aGlzLmNhbWVyYUNhcHR1cmVyKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLmFkZFJlbmRlcmVyKHRoaXMubG9jYWxWaWRlb1ZpZXcpO1xuXG4gICAgICAgICAgICByZXNvbHZlKCk7XG5cbiAgICAgICAgfSlcblxuICAgIH1cblxuXG5cbiAgICBwdWJsaWMgYWRkUmVtb3RlUGFydGljaXBhbnQocmVtb3RlUGFydGljaXBhbnQ6IGFueSkge1xuICAgICAgICBpZiAocmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICBsZXQgcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uID0gcmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5nZXQoMCk7XG4gICAgICAgICAgICBpZiAocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmlzVHJhY2tTdWJzY3JpYmVkKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFJlbW90ZVBhcnRpY2lwYW50VmlkZW8ocmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLmdldFJlbW90ZVZpZGVvVHJhY2soKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICAvKlxuICAgICAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIHBhcnRpY2lwYW50IGV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3RlUGFydGljaXBhbnQuc2V0TGlzdGVuZXIodGhpcy5wYXJ0aWNpcGFudExpc3RlbmVyKCkpO1xuXG4gICAgfVxuXG4gICAgcHJlcGFyZUxvY2FsTWVkaWEoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgLy8gV2Ugd2lsbCBzaGFyZSBsb2NhbCBhdWRpbyBhbmQgdmlkZW8gd2hlbiB3ZSBjb25uZWN0IHRvIHJvb20uXG4gICAgICAgIC8vIENyZWF0ZSBhbiBhdWRpbyB0cmFjay5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmxvY2FsQXVkaW9UcmFjaykge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbEF1ZGlvVHJhY2sgPSBMb2NhbEF1ZGlvVHJhY2suY3JlYXRlKHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5sb2NhbEF1ZGlvVHJhY2spIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoXCJGYWlsZWQgdG8gYWRkIGF1ZGlvIHRyYWNrXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChcIkZhaWxlZCB0byBhZGQgYXVkaW8gdHJhY2tcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIHZpZGVvIHRyYWNrIHdoaWNoIGNhcHR1cmVzIGZyb20gdGhlIGNhbWVyYS5cbiAgICAgICAgICAgIGlmICghdGhpcy5sb2NhbFZpZGVvVHJhY2spIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRQcmV2aWV3KCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgb25FcnJvcihyZWFzb246IHN0cmluZykge1xuICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgZXZlbnROYW1lOiAnZXJyb3InLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICByZWFzb246IHJlYXNvblxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVtb3ZlUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKSB7XG4gICAgICAgIHZpZGVvVHJhY2sucmVtb3ZlUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVSZW1vdGVQYXJ0aWNpcGFudChyZW1vdGVQYXJ0aWNpcGFudCkge1xuXG4gICAgICAgIC8vIGlmICghcmVtb3RlUGFydGljaXBhbnQuZ2V0SWRlbnRpdHkoKS5lcXVhbHMocmVtb3RlUGFydGljaXBhbnRJZGVudGl0eSkpIHtcbiAgICAgICAgLy8gICAgIHJldHVybjtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8qXG4gICAgICAgICogUmVtb3ZlIHJlbW90ZSBwYXJ0aWNpcGFudCByZW5kZXJlclxuICAgICAgICAqL1xuICAgICAgICBpZiAoIXJlbW90ZVBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICBsZXQgcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uID0gcmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5nZXQoMCk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgKiBSZW1vdmUgdmlkZW8gb25seSBpZiBzdWJzY3JpYmVkIHRvIHBhcnRpY2lwYW50IHRyYWNrXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5pc1RyYWNrU3Vic2NyaWJlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQYXJ0aWNpcGFudFZpZGVvKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5nZXRSZW1vdGVWaWRlb1RyYWNrKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbn1cblxuICAgIHB1YmxpYyBjb25uZWN0X3RvX3Jvb20ocm9vbU5hbWU6IHN0cmluZykge1xuXG4gICAgICAgIGlmICghdGhpcy5hY2Nlc3NUb2tlbikge1xuXG4gICAgICAgICAgICB0aGlzLm9uRXJyb3IoJ1BsZWFzZSBwcm92aWRlIGEgdmFsaWQgdG9rZW4gdG8gY29ubmVjdCB0byBhIHJvb20nKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbmZpZ3VyZV9hdWRpbyh0cnVlKTtcblxuICAgICAgICB0aGlzLnByZXBhcmVMb2NhbE1lZGlhKCk7XG5cbiAgICAgICAgbGV0IGNvbm5lY3RPcHRpb25zQnVpbGRlciA9IG5ldyBDb25uZWN0T3B0aW9ucy5CdWlsZGVyKHRoaXMuYWNjZXNzVG9rZW4pLnJvb21OYW1lKHJvb21OYW1lKTtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbEF1ZGlvVHJhY2spIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAqIEFkZCBsb2NhbCBhdWRpbyB0cmFjayB0byBjb25uZWN0IG9wdGlvbnMgdG8gc2hhcmUgd2l0aCBwYXJ0aWNpcGFudHMuXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29ubmVjdE9wdGlvbnNCdWlsZGVyLmF1ZGlvVHJhY2tzKGphdmEudXRpbC5Db2xsZWN0aW9ucy5zaW5nbGV0b25MaXN0KHRoaXMubG9jYWxBdWRpb1RyYWNrKSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEFkZCBsb2NhbCB2aWRlbyB0cmFjayB0byBjb25uZWN0IG9wdGlvbnMgdG8gc2hhcmUgd2l0aCBwYXJ0aWNpcGFudHMuXG4gICAgICAgICAqL1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjaykge1xuXG4gICAgICAgICAgICBjb25uZWN0T3B0aW9uc0J1aWxkZXIudmlkZW9UcmFja3MoamF2YS51dGlsLkNvbGxlY3Rpb25zLnNpbmdsZXRvbkxpc3QodGhpcy5sb2NhbFZpZGVvVHJhY2spKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yb29tID0gVmlkZW8uY29ubmVjdCh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgY29ubmVjdE9wdGlvbnNCdWlsZGVyLmJ1aWxkKCksIHRoaXMucm9vbUxpc3RlbmVyKCkpO1xuXG5cbiAgICB9XG5cbiAgIC8qXG4gICAgKiBTZXQgcHJpbWFyeSB2aWV3IGFzIHJlbmRlcmVyIGZvciBwYXJ0aWNpcGFudCB2aWRlbyB0cmFja1xuICAgICovXG4gICAgcHVibGljIGFkZFJlbW90ZVBhcnRpY2lwYW50VmlkZW8odmlkZW9UcmFjaykge1xuICAgICAgICB0aGlzLnJlbW90ZVZpZGVvVmlldy5zZXRNaXJyb3IodHJ1ZSk7XG4gICAgICAgIHZpZGVvVHJhY2suYWRkUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95X2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLnJlbW92ZVJlbmRlcmVyKHRoaXMubG9jYWxWaWRlb1ZpZXcpO1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gbnVsbFxuXG4gICAgfVxuXG5cbiAgICBkaXNjb25uZWN0KCkge1xuXG4gICAgICAgIHRoaXMucm9vbS5kaXNjb25uZWN0KCk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY2FtZXJhTGlzdGVuZXIoKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IENhbWVyYUNhcHR1cmVyLkxpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uRmlyc3RGcmFtZUF2YWlsYWJsZSgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICd2aWRlb1ZpZXdEaWRSZWNlaXZlRGF0YScsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3OiAndmlldycsXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sIFxuICAgICAgICAgICAgb25FcnJvcihlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5vbkVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuXG4gICAgcHVibGljIHJvb21MaXN0ZW5lcigpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBuZXcgUm9vbS5MaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkNvbm5lY3RlZChyb29tKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSByb29tLmdldFJlbW90ZVBhcnRpY2lwYW50cygpO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5sb2NhbFBhcnRpY2lwYW50ID0gcm9vbS5nZXRMb2NhbFBhcnRpY2lwYW50KCk7XG5cbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdkaWRDb25uZWN0VG9Sb29tJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogbGlzdC5zaXplKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0LnNpemUoKTsgaSA8IGw7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNpcGFudCA9IGxpc3QuZ2V0KGkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0aWNpcGFudC5nZXRWaWRlb1RyYWNrcygpLnNpemUoKSA+IDApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hZGRSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRpZENvbm5lY3RUb1Jvb21cIik7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNvbm5lY3RGYWlsdXJlKHJvb20sIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jb25maWd1cmVfYXVkaW8oZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ2RpZEZhaWxUb0Nvbm5lY3RXaXRoRXJyb3InLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25EaXNjb25uZWN0ZWQocm9vbSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJvb20gPSAnJztcbiAgICAgICAgICAgICAgICBzZWxmLmxvY2FsUGFydGljaXBhbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHNlbGYuY29uZmlndXJlX2F1ZGlvKGZhbHNlKVxuICAgICAgICAgICAgICAgIC8vIGlmIChzZWxmLl9ldmVudCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgZXZlbnROYW1lOiAnb25EaXNjb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25QYXJ0aWNpcGFudENvbm5lY3RlZChyb29tLCBwYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwYXJ0aWNpcGFudERpZENvbm5lY3QnKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudERpZENvbm5lY3QnLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBwYXJ0aWNpcGFudC5nZXRSZW1vdGVWaWRlb1RyYWNrcygpLnNpemUoKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNlbGYuYWRkUmVtb3RlUGFydGljaXBhbnQocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUGFydGljaXBhbnREaXNjb25uZWN0ZWQocm9vbSwgcGFydGljaXBhbnQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudERpZERpc2Nvbm5lY3QnLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlUmVtb3RlUGFydGljaXBhbnQocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUmVjb3JkaW5nU3RhcnRlZChyb29tKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgKiBJbmRpY2F0ZXMgd2hlbiBtZWRpYSBzaGFyZWQgdG8gYSBSb29tIGlzIGJlaW5nIHJlY29yZGVkLiBOb3RlIHRoYXRcbiAgICAgICAgICAgICAgICAgKiByZWNvcmRpbmcgaXMgb25seSBhdmFpbGFibGUgaW4gb3VyIEdyb3VwIFJvb21zIGRldmVsb3BlciBwcmV2aWV3LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIC8vIGlmIChzZWxmLl9ldmVudCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgZXZlbnROYW1lOiAnb25SZWNvcmRpbmdTdGFydGVkJyxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgcm9vbTogcm9vbVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZWNvcmRpbmdTdG9wcGVkKHJvb20pIHtcbiAgICAgICAgICAgICAgICAvLyBpZiAoc2VsZi5fZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGV2ZW50TmFtZTogJ29uUmVjb3JkaW5nU3RvcHBlZCcsXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHJvb206IHJvb21cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLy8gICAgIH0pXG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudExpc3RlbmVyKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUGFydGljaXBhbnQuTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25BdWRpb1RyYWNrUHVibGlzaGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50UHVibGlzaGVkQXVkaW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQXVkaW9UcmFja1VucHVibGlzaGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50VW5wdWJsaXNoZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrUHVibGlzaGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50UHVibGlzaGVkVmlkZW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uVmlkZW9UcmFja1VucHVibGlzaGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50VW5wdWJsaXNoZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BdWRpb1RyYWNrU3Vic2NyaWJlZChyZW1vdGVQYXJ0aWNpcGFudCwgcmVtb3RlQXVkaW9UcmFja1B1YmxpY2F0aW9uLCByZW1vdGVBdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25BdWRpb1RyYWNrU3Vic2NyaWJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcmVtb3RlUGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcmVtb3RlQXVkaW9UcmFja1B1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9UcmFjazogcmVtb3RlQXVkaW9UcmFja1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tVbnN1YnNjcmliZWQocmVtb3RlUGFydGljaXBhbnQsIHJlbW90ZUF1ZGlvVHJhY2tQdWJsaWNhdGlvbiwgcmVtb3RlQXVkaW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQXVkaW9UcmFja1Vuc3Vic2NyaWJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcmVtb3RlUGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcmVtb3RlQXVkaW9UcmFja1B1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9UcmFjazogcmVtb3RlQXVkaW9UcmFja1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tTdWJzY3JpYmVkKHJlbW90ZVBhcnRpY2lwYW50LCByZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24sIHJlbW90ZVZpZGVvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFJlbW90ZVBhcnRpY2lwYW50VmlkZW8ocmVtb3RlVmlkZW9UcmFjayk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJvblZpZGVvVHJhY2tTdWJzY3JpYmVkXCIpXG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25WaWRlb1RyYWNrU3Vic2NyaWJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcmVtb3RlUGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW9UcmFjazogcmVtb3RlVmlkZW9UcmFja1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrVW5zdWJzY3JpYmVkKHJlbW90ZVBhcnRpY2lwYW50LCByZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24sIHJlbW90ZVZpZGVvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJlbW92ZVBhcnRpY2lwYW50VmlkZW8ocmVtb3RlVmlkZW9UcmFjayk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJvblZpZGVvVHJhY2tVbnN1YnNjcmliZWRcIilcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tVbnN1YnNjcmliZWQnLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHJlbW90ZVBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvVHJhY2s6IHJlbW90ZVZpZGVvVHJhY2tcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tEaXNhYmxlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudERpc2FibGVkVmlkZW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25WaWRlb1RyYWNrRW5hYmxlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudEVuYWJsZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tEaXNhYmxlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudERpc2FibGVkQXVkaW9UcmFjaycsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25BdWRpb1RyYWNrRW5hYmxlZChwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudEVuYWJsZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb25maWd1cmVfYXVkaW8oZW5hYmxlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGVuYWJsZSkge1xuXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzQXVkaW9Nb2RlID0gdGhpcy5hdWRpb01hbmFnZXIuZ2V0TW9kZSgpO1xuXG4gICAgICAgICAgICAvLyBSZXF1ZXN0IGF1ZGlvIGZvY3VzIGJlZm9yZSBtYWtpbmcgYW55IGRldmljZSBzd2l0Y2guXG4gICAgICAgICAgICAvLyB0aGlzLmF1ZGlvTWFuYWdlci5yZXF1ZXN0QXVkaW9Gb2N1cyhudWxsLCBBdWRpb01hbmFnZXIuU1RSRUFNX1ZPSUNFX0NBTEwsIEF1ZGlvTWFuYWdlci5BVURJT0ZPQ1VTX0dBSU5fVFJBTlNJRU5UKTtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdEF1ZGlvRm9jdXMoKTtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBVc2UgTU9ERV9JTl9DT01NVU5JQ0FUSU9OIGFzIHRoZSBkZWZhdWx0IGF1ZGlvIG1vZGUuIEl0IGlzIHJlcXVpcmVkXG4gICAgICAgICAgICAgKiB0byBiZSBpbiB0aGlzIG1vZGUgd2hlbiBwbGF5b3V0IGFuZC9vciByZWNvcmRpbmcgc3RhcnRzIGZvciB0aGUgYmVzdFxuICAgICAgICAgICAgICogcG9zc2libGUgVm9JUCBwZXJmb3JtYW5jZS4gU29tZSBkZXZpY2VzIGhhdmUgZGlmZmljdWx0aWVzIHdpdGhcbiAgICAgICAgICAgICAqIHNwZWFrZXIgbW9kZSBpZiB0aGlzIGlzIG5vdCBzZXQuXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0TW9kZShBdWRpb01hbmFnZXIuTU9ERV9JTl9DT01NVU5JQ0FUSU9OKTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIEFsd2F5cyBkaXNhYmxlIG1pY3JvcGhvbmUgbXV0ZSBkdXJpbmcgYSBXZWJSVEMgY2FsbC5cbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzTWljcm9waG9uZU11dGUgPSB0aGlzLmF1ZGlvTWFuYWdlci5pc01pY3JvcGhvbmVNdXRlKCk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNaWNyb3Bob25lTXV0ZShmYWxzZSk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0TW9kZSh0aGlzLnByZXZpb3VzQXVkaW9Nb2RlKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLmFiYW5kb25BdWRpb0ZvY3VzKG51bGwpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0TWljcm9waG9uZU11dGUodGhpcy5wcmV2aW91c01pY3JvcGhvbmVNdXRlKTtcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlcXVlc3RBdWRpb0ZvY3VzKCkge1xuICAgICAgICBpZiAoYW5kcm9pZC5vcy5CdWlsZC5WRVJTSU9OLlNES19JTlQgPj0gYW5kcm9pZC5vcy5CdWlsZC5WRVJTSU9OX0NPREVTLk8pIHtcblxuICAgICAgICAgICAgdmFyIHBsYXliYWNrQXR0cmlidXRlcyA9IG5ldyBBdWRpb0F0dHJpYnV0ZXMuQnVpbGRlcigpXG4gICAgICAgICAgICAgICAgLnNldFVzYWdlKEF1ZGlvQXR0cmlidXRlcy5VU0FHRV9WT0lDRV9DT01NVU5JQ0FUSU9OKVxuICAgICAgICAgICAgICAgIC5zZXRDb250ZW50VHlwZShBdWRpb0F0dHJpYnV0ZXMuQ09OVEVOVF9UWVBFX1NQRUVDSClcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcblxuICAgICAgICAgICAgdmFyIGZvY3VzUmVxdWVzdCA9IG5ldyBBdWRpb0ZvY3VzUmVxdWVzdC5CdWlsZGVyKEF1ZGlvTWFuYWdlci5BVURJT0ZPQ1VTX0dBSU5fVFJBTlNJRU5UKVxuICAgICAgICAgICAgICAgICAgICAuc2V0QXVkaW9BdHRyaWJ1dGVzKHBsYXliYWNrQXR0cmlidXRlcylcbiAgICAgICAgICAgICAgICAgICAgLnNldEFjY2VwdHNEZWxheWVkRm9jdXNHYWluKHRydWUpXG4gICAgICAgICAgICAgICAgICAgIC5zZXRPbkF1ZGlvRm9jdXNDaGFuZ2VMaXN0ZW5lcihuZXcgQXVkaW9NYW5hZ2VyLk9uQXVkaW9Gb2N1c0NoYW5nZUxpc3RlbmVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQXVkaW9Gb2N1c0NoYW5nZShpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLmJ1aWxkKCkpO1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5yZXF1ZXN0QXVkaW9Gb2N1cyhmb2N1c1JlcXVlc3QpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5yZXF1ZXN0QXVkaW9Gb2N1cyhudWxsLCBBdWRpb01hbmFnZXIuU1RSRUFNX1ZPSUNFX0NBTEwsIEF1ZGlvTWFuYWdlci5BVURJT0ZPQ1VTX0dBSU5fVFJBTlNJRU5UKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRfYWNjZXNzX3Rva2VuKHRva2VuOiBzdHJpbmcpIHtcblxuICAgICAgICB0aGlzLmFjY2Vzc1Rva2VuID0gdG9rZW47XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlID0gIXRoaXMubG9jYWxWaWRlb1RyYWNrLmlzRW5hYmxlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5lbmFibGUoZW5hYmxlKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvLyBwdWJsaWMgcmVtb3ZlX3ZpZGVvX2NoYXRfdHdpbGlvX2xpc3RlbmVycygpOiB2b2lkIHtcblxuICAgIC8vICAgICB0aGlzLmV2ZW50Lm9mZignb25Db25uZWN0ZWQnKTtcbiAgICAvLyAgICAgdGhpcy5ldmVudC5vZmYoJ29uUGFydGljaXBhbnRDb25uZWN0ZWQnKTtcbiAgICAvLyAgICAgdGhpcy5ldmVudC5vZmYoJ29uVmlkZW9UcmFja0FkZGVkJyk7XG4gICAgLy8gICAgIHRoaXMuZXZlbnQub2ZmKCdvbkRpc2Nvbm5lY3RlZCcpO1xuICAgIC8vICAgICB0aGlzLmV2ZW50Lm9mZignb25Db25uZWN0RmFpbHVyZScpO1xuICAgIC8vICAgICB0aGlzLmV2ZW50Lm9mZignb25QYXJ0aWNpcGFudERpc2Nvbm5lY3RlZCcpO1xuICAgIC8vICAgICB0aGlzLmV2ZW50Lm9mZignb25BdWRpb1RyYWNrQWRkZWQnKTtcbiAgICAvLyAgICAgdGhpcy5ldmVudC5vZmYoJ29uVmlkZW9UcmFja1JlbW92ZWQnKTtcbiAgICAvLyAgICAgdGhpcy5ldmVudC5vZmYoJ29uQXVkaW9UcmFja0VuYWJsZWQnKTtcbiAgICAvLyAgICAgdGhpcy5ldmVudC5vZmYoJ29uQXVkaW9UcmFja0Rpc2FibGVkJyk7XG4gICAgLy8gICAgIHRoaXMuZXZlbnQub2ZmKCdvblZpZGVvVHJhY2tFbmFibGVkJyk7XG4gICAgLy8gICAgIHRoaXMuZXZlbnQub2ZmKCdvblZpZGVvVHJhY2tEaXNhYmxlZCcpO1xuICAgIC8vICAgICB0aGlzLmV2ZW50Lm9mZignc3Vic2NyaWJlZFRvVmlkZW9UcmFja1B1YmxpY2F0aW9uRm9yUGFydGljaXBhbnQnKTtcbiAgICAvLyAgICAgdGhpcy5ldmVudC5vZmYoJ3Vuc3Vic2NyaWJlZEZyb21WaWRlb1RyYWNrUHVibGljYXRpb25Gb3JQYXJ0aWNpcGFudCcpO1xuICAgIC8vIH1cblxuICAgIC8qKlxuICAgICAqIGN1cnJlbnRseSBub3QgdXNpbmcgdG9nZ2xlX2xvY2FsX2F1ZGlvXG4gICAgICogbm90IHN1cmUgaWYgaXRzIGJldHRlciB0byB1c2UgdGhpcyBtZXRob2Qgb3IgY29uZmlndXJlX2F1ZGlvXG4gICAgICovXG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX2F1ZGlvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsQXVkaW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlZCA9ICF0aGlzLmxvY2FsQXVkaW9UcmFjay5pc0VuYWJsZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5sb2NhbEF1ZGlvVHJhY2suZW5hYmxlKGVuYWJsZWQpO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxufSJdfQ==
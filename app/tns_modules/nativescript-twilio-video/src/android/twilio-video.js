"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("tns-core-modules/utils/utils");
var remoteVideo_1 = require("./remoteVideo");
var localVideo_1 = require("./localVideo");
var observable_1 = require("tns-core-modules/data/observable");
var app = require("application");
var AudioManager = android.media.AudioManager;
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
var Participant = com.twilio.video.Participant;
var Room = com.twilio.video.Room;
var VideoTrack = com.twilio.video.VideoTrack;
var VideoActivity = (function () {
    function VideoActivity() {
        var localVideo = new localVideo_1.LocalVideo();
        var remoteVideo = new remoteVideo_1.RemoteVideo();
        this.localVideoView = localVideo.get_local_view();
        this.remoteVideoView = remoteVideo.get_remote_view();
        this.audioManager = app.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
        this.videoEvent = new observable_1.Observable();
        this._roomListener = this.roomListener();
        this._participantListener = this.participantListener();
    }
    VideoActivity.prototype.createAudioAndVideoTracks = function () {
        if (this.localVideoTrack)
            return;
        this.localVideoView.setMirror(true);
        this.localAudioTrack = LocalAudioTrack.create(utils.ad.getApplicationContext(), true);
        this.cameraCapturer = new CameraCapturer(utils.ad.getApplicationContext(), CameraCapturer.CameraSource.FRONT_CAMERA);
        this.localVideoTrack = LocalVideoTrack.create(utils.ad.getApplicationContext(), true, this.cameraCapturer);
        this.localVideoTrack.addRenderer(this.localVideoView);
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
            this.localAudioTrack(enabled);
        }
    };
    VideoActivity.prototype.destroy_local_video = function () {
        this.localVideoTrack.removeRenderer(this.localVideoView);
        this.localVideoTrack = null;
    };
    VideoActivity.prototype.destroy_local_audio = function () {
        this.localVideoTrack.removeRenderer(this.localVideoView);
        this.localVideoTrack = null;
    };
    VideoActivity.prototype.connect_to_room = function (roomName) {
        this.configureAudio(true);
        var connectOptionsBuilder = new ConnectOptions.Builder(this.accessToken).roomName(roomName);
        if (this.localAudioTrack !== null) {
            connectOptionsBuilder.audioTracks(java.util.Collections.singletonList(this.localAudioTrack));
        }
        if (this.localVideoTrack !== null) {
            connectOptionsBuilder.videoTracks(java.util.Collections.singletonList(this.localVideoTrack));
        }
        this.room = Video.connect(utils.ad.getApplicationContext(), connectOptionsBuilder.build(), this._roomListener);
    };
    VideoActivity.prototype.set_access_token = function (token, name) {
        this.accessToken = token;
        this.name = name;
    };
    VideoActivity.prototype.disconnect_from_room = function () {
        if (!this.localParticipant)
            return;
        this.localParticipant.removeVideoTrack(this.localVideoTrack);
        this.localParticipant = null;
        this.localVideoTrack.release();
        this.localVideoTrack = null;
    };
    VideoActivity.prototype.roomListener = function () {
        var self = this;
        return new Room.Listener({
            onConnected: function (room) {
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
                        object: observable_1.fromObject({
                            room: room,
                            string: 'string'
                        })
                    });
                }
            },
            onConnectFailure: function (room, error) {
                console.log(error);
                self.configureAudio(false);
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onConnectFailure',
                        object: observable_1.fromObject({
                            room: room,
                            error: error
                        })
                    });
                }
            },
            onDisconnected: function (room, error) {
                console.log("Disconnected from " + room.getName());
                self.room = null;
                self.configureAudio(false);
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onDisconnected',
                        object: observable_1.fromObject({
                            room: room,
                            error: error
                        })
                    });
                }
            },
            onParticipantConnected: function (room, participant) {
                self.addParticipant(participant);
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onParticipantConnected',
                        object: observable_1.fromObject({
                            room: room,
                            participant: participant
                        })
                    });
                }
            },
            onParticipantDisconnected: function (room, participant) {
                self.removeParticipant(participant);
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onParticipantDisconnected',
                        object: observable_1.fromObject({
                            room: room,
                            participant: participant
                        })
                    });
                }
            },
            onRecordingStarted: function (room) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onRecordingStarted',
                        object: observable_1.fromObject({
                            room: room
                        })
                    });
                }
            },
            onRecordingStopped: function (room) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onRecordingStopped',
                        object: observable_1.fromObject({
                            room: room
                        })
                    });
                }
            }
        });
    };
    VideoActivity.prototype.participantListener = function () {
        var self = this;
        return new Participant.Listener({
            onAudioTrackAdded: function (participant, audioTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onAudioTrackAdded',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onAudioTrackRemoved: function (participant, audioTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onAudioTrackRemoved',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onVideoTrackAdded: function (participant, videoTrack) {
                self.addParticipantVideo(videoTrack);
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onVideoTrackAdded',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onVideoTrackRemoved: function (participant, VideoTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onVideoTrackRemoved',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onAudioTrackEnabled: function (participant, AudioTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onAudioTrackEnabled',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onAudioTrackDisabled: function (participant, AudioTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onAudioTrackDisabled',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onVideoTrackEnabled: function (participant, VideoTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onVideoTrackEnabled',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onVideoTrackDisabled: function (participant, VideoTrack) {
                if (self.videoEvent) {
                    self.videoEvent.notify({
                        eventName: 'onVideoTrackDisabled',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            }
        });
    };
    VideoActivity.prototype.addParticipant = function (participant) {
        if (participant.getVideoTracks().size() > 0) {
            this.addParticipantVideo(participant.getVideoTracks().get(0));
        }
        participant.setListener(this._participantListener);
    };
    VideoActivity.prototype.addParticipantVideo = function (videoTrack) {
        this.localVideoView.setMirror(false);
        videoTrack.addRenderer(this.remoteVideoView);
    };
    VideoActivity.prototype.removeParticipant = function (participant) {
        if (participant.getVideoTracks().size() > 0) {
            this.removeParticipantVideo(participant.getVideoTracks().get(0));
        }
        participant.setListener(null);
    };
    VideoActivity.prototype.removeParticipantVideo = function (videoTrack) {
        videoTrack.removeRenderer(this.remoteVideoView);
    };
    VideoActivity.prototype.configureAudio = function (enable) {
        if (enable) {
            this.previousAudioMode = this.audioManager.getMode();
            this.audioManager.requestAudioFocus(null, AudioManager.STREAM_VOICE_CALL, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
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
    return VideoActivity;
}());
exports.VideoActivity = VideoActivity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdpbGlvLXZpZGVvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdpbGlvLXZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsb0RBQXNEO0FBQ3RELDZDQUE0QztBQUM1QywyQ0FBMEM7QUFDMUMsK0RBQTBFO0FBRzFFLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUlqQyxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztBQUNoRCxJQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDO0FBQzNELElBQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUM3QyxJQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDckMsSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDO0FBQ3JELElBQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUN6RCxJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7QUFDL0MsSUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDO0FBQ3ZELElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztBQUN2RCxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7QUFDekQsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO0FBQ3pELElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FB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XG5cbmltcG9ydCB7IFZpZXcgfSBmcm9tICd1aS9jb3JlL3ZpZXcnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHNcIjtcbmltcG9ydCB7IFJlbW90ZVZpZGVvIH0gZnJvbSBcIi4vcmVtb3RlVmlkZW9cIjtcbmltcG9ydCB7IExvY2FsVmlkZW8gfSBmcm9tIFwiLi9sb2NhbFZpZGVvXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tT2JqZWN0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGUnO1xuaW1wb3J0IHsgVmlkZW9BY3Rpdml0eUJhc2UgfSBmcm9tIFwiLi4vdHdpbGlvLWNvbW1vblwiO1xuXG52YXIgYXBwID0gcmVxdWlyZShcImFwcGxpY2F0aW9uXCIpO1xuXG5kZWNsYXJlIHZhciBjb20sIGFuZHJvaWQ6IGFueTtcblxuY29uc3QgQXVkaW9NYW5hZ2VyID0gYW5kcm9pZC5tZWRpYS5BdWRpb01hbmFnZXI7XG5jb25zdCBMb2NhbFBhcnRpY2lwYW50ID0gY29tLnR3aWxpby52aWRlby5Mb2NhbFBhcnRpY2lwYW50O1xuY29uc3QgUm9vbVN0YXRlID0gY29tLnR3aWxpby52aWRlby5Sb29tU3RhdGU7XG5jb25zdCBWaWRlbyA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW87XG5jb25zdCBWaWRlb1JlbmRlcmVyID0gY29tLnR3aWxpby52aWRlby5WaWRlb1JlbmRlcmVyO1xuY29uc3QgVHdpbGlvRXhjZXB0aW9uID0gY29tLnR3aWxpby52aWRlby5Ud2lsaW9FeGNlcHRpb247XG5jb25zdCBBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5BdWRpb1RyYWNrO1xuY29uc3QgQ2FtZXJhQ2FwdHVyZXIgPSBjb20udHdpbGlvLnZpZGVvLkNhbWVyYUNhcHR1cmVyO1xuY29uc3QgQ29ubmVjdE9wdGlvbnMgPSBjb20udHdpbGlvLnZpZGVvLkNvbm5lY3RPcHRpb25zO1xuY29uc3QgTG9jYWxBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbEF1ZGlvVHJhY2s7XG5jb25zdCBMb2NhbFZpZGVvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsVmlkZW9UcmFjaztcbmNvbnN0IFBhcnRpY2lwYW50ID0gY29tLnR3aWxpby52aWRlby5QYXJ0aWNpcGFudDtcbmNvbnN0IFJvb20gPSBjb20udHdpbGlvLnZpZGVvLlJvb207XG5jb25zdCBWaWRlb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5WaWRlb1RyYWNrO1xuXG4vLyBjb25zdCBWaWRlb1ZpZXc6IGFueSA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9WaWV3O1xuLy8gY29uc3QgdmlkZW9WaWV3ID0gbmV3IFZpZGVvVmlldyh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSk7XG5cbi8vIGNvbnN0IHF1aWNrc3RhcnQuUiA9IGNvbS50d2lsaW8udmlkZW8ucXVpY2tzdGFydC5SO1xuLy8gY29uc3QgcXVpY2tzdGFydC5kaWFsb2cuRGlhbG9nID0gY29tLnR3aWxpby52aWRlby5xdWlja3N0YXJ0LmRpYWxvZy5EaWFsb2c7XG4vLyBjb25zdCBDYW1lcmFDYXB0dXJlci5DYW1lcmFTb3VyY2UgPSBjb20udHdpbGlvLnZpZGVvLkNhbWVyYUNhcHR1cmVyLkNhbWVyYVNvdXJjZTtcblxuZXhwb3J0IGNsYXNzIFZpZGVvQWN0aXZpdHkgaW1wbGVtZW50cyBWaWRlb0FjdGl2aXR5QmFzZSB7XG5cbiAgICBwdWJsaWMgcHJldmlvdXNBdWRpb01vZGU6IGFueTtcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1ZpZXc6IGFueTsgXG4gICAgcHVibGljIHJlbW90ZVZpZGVvVmlldzogYW55OyBcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1RyYWNrOiBhbnk7XG4gICAgcHVibGljIGxvY2FsQXVkaW9UcmFjazogYW55O1xuICAgIHB1YmxpYyBjYW1lcmFDYXB0dXJlcjogYW55O1xuICAgIHB1YmxpYyBhY2Nlc3NUb2tlbjogc3RyaW5nO1xuICAgIHB1YmxpYyBUV0lMSU9fQUNDRVNTX1RPS0VOOiBzdHJpbmc7XG4gICAgcHVibGljIHJvb206IHN0cmluZztcbiAgICBwdWJsaWMgcGFydGljaXBhbnRJZGVudGl0eTogc3RyaW5nO1xuICAgIHB1YmxpYyBwcmV2aW91c01pY3JvcGhvbmVNdXRlOiBib29sZWFuO1xuICAgIHB1YmxpYyBsb2NhbFBhcnRpY2lwYW50OiBhbnk7XG4gICAgcHVibGljIGF1ZGlvTWFuYWdlcjogYW55O1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIHZpZGVvRXZlbnQ6IE9ic2VydmFibGU7XG4gICAgcHJpdmF0ZSBfcm9vbUxpc3RlbmVyOiBhbnk7XG4gICAgcHJpdmF0ZSBfcGFydGljaXBhbnRMaXN0ZW5lcjogYW55O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIHN1cGVyKCk7XG4gICAgICAgIGxldCBsb2NhbFZpZGVvID0gbmV3IExvY2FsVmlkZW8oKTtcbiAgICAgICAgbGV0IHJlbW90ZVZpZGVvID0gbmV3IFJlbW90ZVZpZGVvKCk7XG5cbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVmlldyA9IGxvY2FsVmlkZW8uZ2V0X2xvY2FsX3ZpZXcoKTtcbiAgICAgICAgdGhpcy5yZW1vdGVWaWRlb1ZpZXcgPSByZW1vdGVWaWRlby5nZXRfcmVtb3RlX3ZpZXcoKTtcbiAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIgPSBhcHAuYW5kcm9pZC5jb250ZXh0LmdldFN5c3RlbVNlcnZpY2UoYW5kcm9pZC5jb250ZW50LkNvbnRleHQuQVVESU9fU0VSVklDRSk7XG4gICAgICAgIHRoaXMudmlkZW9FdmVudCA9IG5ldyBPYnNlcnZhYmxlKCk7XG4gICAgICAgIHRoaXMuX3Jvb21MaXN0ZW5lciA9IHRoaXMucm9vbUxpc3RlbmVyKClcbiAgICAgICAgdGhpcy5fcGFydGljaXBhbnRMaXN0ZW5lciA9IHRoaXMucGFydGljaXBhbnRMaXN0ZW5lcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVBdWRpb0FuZFZpZGVvVHJhY2tzKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjaykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1ZpZXcuc2V0TWlycm9yKHRydWUpO1xuICAgICAgICB0aGlzLmxvY2FsQXVkaW9UcmFjayA9IExvY2FsQXVkaW9UcmFjay5jcmVhdGUodXRpbHMuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCksIHRydWUpO1xuICAgICAgICB0aGlzLmNhbWVyYUNhcHR1cmVyID0gbmV3IENhbWVyYUNhcHR1cmVyKHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCBDYW1lcmFDYXB0dXJlci5DYW1lcmFTb3VyY2UuRlJPTlRfQ0FNRVJBKTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sgPSBMb2NhbFZpZGVvVHJhY2suY3JlYXRlKHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlLCB0aGlzLmNhbWVyYUNhcHR1cmVyKTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2suYWRkUmVuZGVyZXIodGhpcy5sb2NhbFZpZGVvVmlldyk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlID0gIXRoaXMubG9jYWxWaWRlb1RyYWNrLmlzRW5hYmxlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5lbmFibGUoZW5hYmxlKTtcblxuICAgICAgICB9XG5cbiAgICB9ICBcblxuICAgIHB1YmxpYyB0b2dnbGVfbG9jYWxfYXVkaW8oKSB7XG5cbiAgICAgICAgaWYgKHRoaXMubG9jYWxBdWRpb1RyYWNrKSB7XG5cbiAgICAgICAgICAgIGxldCBlbmFibGVkID0gIXRoaXMubG9jYWxBdWRpb1RyYWNrLmlzRW5hYmxlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLmxvY2FsQXVkaW9UcmFjayhlbmFibGVkKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveV9sb2NhbF92aWRlbygpIHtcblxuICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5yZW1vdmVSZW5kZXJlcih0aGlzLmxvY2FsVmlkZW9WaWV3KTtcblxuICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjayA9IG51bGxcbiAgICAgICAgXG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveV9sb2NhbF9hdWRpbygpIHtcblxuICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5yZW1vdmVSZW5kZXJlcih0aGlzLmxvY2FsVmlkZW9WaWV3KTtcblxuICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjayA9IG51bGxcblxuICAgIH0gICAgICBcblxuICAgIHB1YmxpYyBjb25uZWN0X3RvX3Jvb20ocm9vbU5hbWU6IHN0cmluZykge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jb25maWd1cmVBdWRpbyh0cnVlKTtcblxuICAgICAgICBsZXQgY29ubmVjdE9wdGlvbnNCdWlsZGVyID0gbmV3IENvbm5lY3RPcHRpb25zLkJ1aWxkZXIodGhpcy5hY2Nlc3NUb2tlbikucm9vbU5hbWUocm9vbU5hbWUpO1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsQXVkaW9UcmFjayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICogQWRkIGxvY2FsIGF1ZGlvIHRyYWNrIHRvIGNvbm5lY3Qgb3B0aW9ucyB0byBzaGFyZSB3aXRoIHBhcnRpY2lwYW50cy5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25uZWN0T3B0aW9uc0J1aWxkZXIuYXVkaW9UcmFja3MoamF2YS51dGlsLkNvbGxlY3Rpb25zLnNpbmdsZXRvbkxpc3QodGhpcy5sb2NhbEF1ZGlvVHJhY2spKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLypcbiAgICAgICAgICogQWRkIGxvY2FsIHZpZGVvIHRyYWNrIHRvIGNvbm5lY3Qgb3B0aW9ucyB0byBzaGFyZSB3aXRoIHBhcnRpY2lwYW50cy5cbiAgICAgICAgICovXG5cbiAgICAgICAgaWYgKHRoaXMubG9jYWxWaWRlb1RyYWNrICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIGNvbm5lY3RPcHRpb25zQnVpbGRlci52aWRlb1RyYWNrcyhqYXZhLnV0aWwuQ29sbGVjdGlvbnMuc2luZ2xldG9uTGlzdCh0aGlzLmxvY2FsVmlkZW9UcmFjaykpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJvb20gPSBWaWRlby5jb25uZWN0KHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCBjb25uZWN0T3B0aW9uc0J1aWxkZXIuYnVpbGQoKSwgdGhpcy5fcm9vbUxpc3RlbmVyKTtcblxuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgc2V0X2FjY2Vzc190b2tlbih0b2tlbjogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcblxuICAgICAgICB0aGlzLmFjY2Vzc1Rva2VuID0gdG9rZW47XG5cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBkaXNjb25uZWN0X2Zyb21fcm9vbSgpIHtcbiAgICAgICAgLy8gbG9jYWxQYXJ0aWNpcGFudFxuICAgICAgICBpZiAoIXRoaXMubG9jYWxQYXJ0aWNpcGFudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmxvY2FsUGFydGljaXBhbnQucmVtb3ZlVmlkZW9UcmFjayh0aGlzLmxvY2FsVmlkZW9UcmFjayk7XG4gICAgICAgIHRoaXMubG9jYWxQYXJ0aWNpcGFudCA9IG51bGw7XG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLnJlbGVhc2UoKTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sgPSBudWxsOyAgICAgICAgXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcm9vbUxpc3RlbmVyKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBSb29tLkxpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQ29ubmVjdGVkKHJvb20pIHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IHJvb20uZ2V0UGFydGljaXBhbnRzKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2NhbFBhcnRpY2lwYW50ID0gcm9vbS5nZXRMb2NhbFBhcnRpY2lwYW50KCk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3Quc2l6ZSgpOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNpcGFudCA9IGxpc3QuZ2V0KGkpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFkZFBhcnRpY2lwYW50KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJvbkNvbm5lY3RlZDogXCIsIHNlbGYubmFtZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi52aWRlb0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudmlkZW9FdmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25Db25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZzogJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ29ubmVjdEZhaWx1cmUocm9vbSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgc2VsZi5jb25maWd1cmVBdWRpbyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYudmlkZW9FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnZpZGVvRXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQ29ubmVjdEZhaWx1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uRGlzY29ubmVjdGVkKHJvb20sIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJEaXNjb25uZWN0ZWQgZnJvbSBcIiArIHJvb20uZ2V0TmFtZSgpKTtcbiAgICAgICAgICAgICAgICBzZWxmLnJvb20gPSBudWxsO1xuICAgICAgICAgICAgICAgIC8vIE9ubHkgcmVpbml0aWFsaXplIHRoZSBVSSBpZiBkaXNjb25uZWN0IHdhcyBub3QgY2FsbGVkIGZyb20gb25EZXN0cm95KClcbiAgICAgICAgICAgICAgICAvLyBpZiAoIWRpc2Nvbm5lY3RlZEZyb21PbkRlc3Ryb3kpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNvbmZpZ3VyZUF1ZGlvKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgaW50aWFsaXplVUkoKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgbW92ZUxvY2FsVmlkZW9Ub1ByaW1hcnlWaWV3KCk7XG4gICAgICAgICAgICAgICAgLy8gfSBcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi52aWRlb0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudmlkZW9FdmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25EaXNjb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUGFydGljaXBhbnRDb25uZWN0ZWQocm9vbSwgcGFydGljaXBhbnQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFBhcnRpY2lwYW50KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi52aWRlb0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudmlkZW9FdmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25QYXJ0aWNpcGFudENvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25QYXJ0aWNpcGFudERpc2Nvbm5lY3RlZChyb29tLCBwYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlUGFydGljaXBhbnQocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnZpZGVvRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi52aWRlb0V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblBhcnRpY2lwYW50RGlzY29ubmVjdGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblJlY29yZGluZ1N0YXJ0ZWQocm9vbSkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICogSW5kaWNhdGVzIHdoZW4gbWVkaWEgc2hhcmVkIHRvIGEgUm9vbSBpcyBiZWluZyByZWNvcmRlZC4gTm90ZSB0aGF0XG4gICAgICAgICAgICAgICAgICogcmVjb3JkaW5nIGlzIG9ubHkgYXZhaWxhYmxlIGluIG91ciBHcm91cCBSb29tcyBkZXZlbG9wZXIgcHJldmlldy5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi52aWRlb0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudmlkZW9FdmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25SZWNvcmRpbmdTdGFydGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUmVjb3JkaW5nU3RvcHBlZChyb29tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYudmlkZW9FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnZpZGVvRXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uUmVjb3JkaW5nU3RvcHBlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRMaXN0ZW5lcigpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IFBhcnRpY2lwYW50Lkxpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQXVkaW9UcmFja0FkZGVkKHBhcnRpY2lwYW50LCBhdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYudmlkZW9FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnZpZGVvRXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQXVkaW9UcmFja0FkZGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BdWRpb1RyYWNrUmVtb3ZlZChwYXJ0aWNpcGFudCwgYXVkaW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnZpZGVvRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi52aWRlb0V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkF1ZGlvVHJhY2tSZW1vdmVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrQWRkZWQocGFydGljaXBhbnQsIHZpZGVvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLmFkZFBhcnRpY2lwYW50VmlkZW8odmlkZW9UcmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYudmlkZW9FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnZpZGVvRXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uVmlkZW9UcmFja0FkZGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrUmVtb3ZlZChwYXJ0aWNpcGFudCwgVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnZpZGVvRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi52aWRlb0V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tSZW1vdmVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BdWRpb1RyYWNrRW5hYmxlZChwYXJ0aWNpcGFudCwgQXVkaW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnZpZGVvRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi52aWRlb0V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkF1ZGlvVHJhY2tFbmFibGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tEaXNhYmxlZChwYXJ0aWNpcGFudCwgQXVkaW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnZpZGVvRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi52aWRlb0V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkF1ZGlvVHJhY2tEaXNhYmxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrRW5hYmxlZChwYXJ0aWNpcGFudCwgVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnZpZGVvRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi52aWRlb0V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tFbmFibGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tEaXNhYmxlZChwYXJ0aWNpcGFudCwgVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnZpZGVvRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi52aWRlb0V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tEaXNhYmxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYWRkUGFydGljaXBhbnQocGFydGljaXBhbnQ6IGFueSkge1xuICAgICAgICBcblxuICAgICAgICBpZiAocGFydGljaXBhbnQuZ2V0VmlkZW9UcmFja3MoKS5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFBhcnRpY2lwYW50VmlkZW8ocGFydGljaXBhbnQuZ2V0VmlkZW9UcmFja3MoKS5nZXQoMCkpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvKlxuICAgICAgICAgKiBTdGFydCBsaXN0ZW5pbmcgZm9yIHBhcnRpY2lwYW50IGV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgcGFydGljaXBhbnQuc2V0TGlzdGVuZXIodGhpcy5fcGFydGljaXBhbnRMaXN0ZW5lcik7XG5cbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFNldCBwcmltYXJ5IHZpZXcgYXMgcmVuZGVyZXIgZm9yIHBhcnRpY2lwYW50IHZpZGVvIHRyYWNrXG4gICAgICovXG4gICAgcHVibGljIGFkZFBhcnRpY2lwYW50VmlkZW8odmlkZW9UcmFjaykge1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9WaWV3LnNldE1pcnJvcihmYWxzZSk7XG4gICAgICAgIHZpZGVvVHJhY2suYWRkUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBSZW1vdmUgcGFydGljaXBhbnQgcmVuZGVyZXJcbiAgICAgICAgICovXG4gICAgICAgIGlmIChwYXJ0aWNpcGFudC5nZXRWaWRlb1RyYWNrcygpLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlUGFydGljaXBhbnRWaWRlbyhwYXJ0aWNpcGFudC5nZXRWaWRlb1RyYWNrcygpLmdldCgwKSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFydGljaXBhbnQuc2V0TGlzdGVuZXIobnVsbCk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKSB7IFxuICAgICAgICB2aWRlb1RyYWNrLnJlbW92ZVJlbmRlcmVyKHRoaXMucmVtb3RlVmlkZW9WaWV3KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29uZmlndXJlQXVkaW8oZW5hYmxlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGVuYWJsZSkge1xuXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzQXVkaW9Nb2RlID0gdGhpcy5hdWRpb01hbmFnZXIuZ2V0TW9kZSgpO1xuXG4gICAgICAgICAgICAvLyBSZXF1ZXN0IGF1ZGlvIGZvY3VzIGJlZm9yZSBtYWtpbmcgYW55IGRldmljZSBzd2l0Y2guXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5yZXF1ZXN0QXVkaW9Gb2N1cyhudWxsLCBBdWRpb01hbmFnZXIuU1RSRUFNX1ZPSUNFX0NBTEwsIEF1ZGlvTWFuYWdlci5BVURJT0ZPQ1VTX0dBSU5fVFJBTlNJRU5UKTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIFVzZSBNT0RFX0lOX0NPTU1VTklDQVRJT04gYXMgdGhlIGRlZmF1bHQgYXVkaW8gbW9kZS4gSXQgaXMgcmVxdWlyZWRcbiAgICAgICAgICAgICAqIHRvIGJlIGluIHRoaXMgbW9kZSB3aGVuIHBsYXlvdXQgYW5kL29yIHJlY29yZGluZyBzdGFydHMgZm9yIHRoZSBiZXN0XG4gICAgICAgICAgICAgKiBwb3NzaWJsZSBWb0lQIHBlcmZvcm1hbmNlLiBTb21lIGRldmljZXMgaGF2ZSBkaWZmaWN1bHRpZXMgd2l0aFxuICAgICAgICAgICAgICogc3BlYWtlciBtb2RlIGlmIHRoaXMgaXMgbm90IHNldC5cbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNb2RlKEF1ZGlvTWFuYWdlci5NT0RFX0lOX0NPTU1VTklDQVRJT04pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogQWx3YXlzIGRpc2FibGUgbWljcm9waG9uZSBtdXRlIGR1cmluZyBhIFdlYlJUQyBjYWxsLlxuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNNaWNyb3Bob25lTXV0ZSA9IHRoaXMuYXVkaW9NYW5hZ2VyLmlzTWljcm9waG9uZU11dGUoKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1pY3JvcGhvbmVNdXRlKGZhbHNlKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNb2RlKHRoaXMucHJldmlvdXNBdWRpb01vZGUpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuYWJhbmRvbkF1ZGlvRm9jdXMobnVsbCk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNaWNyb3Bob25lTXV0ZSh0aGlzLnByZXZpb3VzTWljcm9waG9uZU11dGUpO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbn0iXX0=
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("tns-core-modules/utils/utils");
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
        this.audioManager = app.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
        this._events = new observable_1.Observable();
    }
    Object.defineProperty(VideoActivity.prototype, "events", {
        get: function () {
            return this._events;
        },
        enumerable: true,
        configurable: true
    });
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
    VideoActivity.prototype.add_video_track = function (videoTrack) {
        this.addParticipantVideo(videoTrack);
    };
    VideoActivity.prototype.destroy_local_video = function () {
        this.localVideoTrack.removeRenderer(this.localVideoView);
        this.localVideoTrack = null;
    };
    VideoActivity.prototype.destroy_local_audio = function () {
    };
    VideoActivity.prototype.connect_to_room = function (roomName) {
        this.configure_audio(true);
        var connectOptionsBuilder = new ConnectOptions.Builder(this.accessToken).roomName(roomName);
        if (this.localAudioTrack !== null) {
            connectOptionsBuilder.audioTracks(java.util.Collections.singletonList(this.localAudioTrack));
        }
        if (this.localVideoTrack !== null) {
            connectOptionsBuilder.videoTracks(java.util.Collections.singletonList(this.localVideoTrack));
        }
        this.roomObj = Video.connect(utils.ad.getApplicationContext(), connectOptionsBuilder.build(), this.roomListener());
    };
    VideoActivity.prototype.set_access_token = function (token) {
        this.accessToken = token;
    };
    VideoActivity.prototype.disconnect_from_room = function () {
        if (!this.localParticipant)
            return;
        this.localParticipant.removeVideoTrack(this.localVideoTrack);
        this.localParticipant = null;
        this.localVideoTrack.release();
        this.localVideoTrack = null;
    };
    VideoActivity.prototype.set_listener_for_participants = function (room) {
        var list = room.getParticipants();
        this.localParticipant = room.getLocalParticipant();
        for (var i = 0, l = list.size(); i < l; i++) {
            var participant = list.get(i);
            if (participant.getVideoTracks().size() > 0) {
                this.addParticipantVideo(participant.getVideoTracks().get(0));
            }
            participant.setListener(this.participantListener());
        }
    };
    VideoActivity.prototype.participant_joined_room = function (participant) {
        this.addParticipant(participant);
    };
    VideoActivity.prototype.roomListener = function () {
        var self = this;
        return new Room.Listener({
            onConnected: function (room) {
                if (self._events) {
                    self._events.notify({
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
                if (self._events) {
                    self._events.notify({
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
                if (self._events) {
                    self._events.notify({
                        eventName: 'onDisconnected',
                        object: observable_1.fromObject({
                            room: room,
                            error: error
                        })
                    });
                }
            },
            onParticipantConnected: function (room, participant) {
                if (self._events) {
                    self._events.notify({
                        eventName: 'onParticipantConnected',
                        object: observable_1.fromObject({
                            room: room,
                            participant: participant
                        })
                    });
                }
            },
            onParticipantDisconnected: function (room, participant) {
                if (self._events) {
                    self._events.notify({
                        eventName: 'onParticipantDisconnected',
                        object: observable_1.fromObject({
                            room: room,
                            participant: participant
                        })
                    });
                }
            },
            onRecordingStarted: function (room) {
                if (self._events) {
                    self._events.notify({
                        eventName: 'onRecordingStarted',
                        object: observable_1.fromObject({
                            room: room
                        })
                    });
                }
            },
            onRecordingStopped: function (room) {
                if (self._events) {
                    self._events.notify({
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
                if (self._events) {
                    self._events.notify({
                        eventName: 'onAudioTrackAdded',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onAudioTrackRemoved: function (participant, audioTrack) {
                if (self._events) {
                    self._events.notify({
                        eventName: 'onAudioTrackRemoved',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onVideoTrackAdded: function (participant, videoTrack) {
                if (self._events) {
                    self._events.notify({
                        eventName: 'onVideoTrackAdded',
                        object: observable_1.fromObject({
                            participant: participant,
                            videoTrack: videoTrack
                        })
                    });
                }
            },
            onVideoTrackRemoved: function (participant, videoTrack) {
                if (self._events) {
                    self._events.notify({
                        eventName: 'onVideoTrackRemoved',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onAudioTrackEnabled: function (participant, audioTrack) {
                if (self._events) {
                    self._events.notify({
                        eventName: 'onAudioTrackEnabled',
                        object: observable_1.fromObject({
                            participant: participant,
                            audioTrack: audioTrack
                        })
                    });
                }
            },
            onAudioTrackDisabled: function (participant, audioTrack) {
                if (self._events) {
                    self._events.notify({
                        eventName: 'onAudioTrackDisabled',
                        object: observable_1.fromObject({
                            participant: participant,
                            audioTrack: audioTrack
                        })
                    });
                }
            },
            onVideoTrackEnabled: function (participant, VideoTrack) {
                if (self._events) {
                    self._events.notify({
                        eventName: 'onVideoTrackEnabled',
                        object: observable_1.fromObject({
                            participant: participant
                        })
                    });
                }
            },
            onVideoTrackDisabled: function (participant, VideoTrack) {
                if (self._events) {
                    self._events.notify({
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
        participant.setListener(this.participantListener());
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
    VideoActivity.prototype.toggle_local_audio = function () {
        if (this.localAudioTrack) {
            var enabled = !this.localAudioTrack.isEnabled();
            this.localAudioTrack.enable(enabled);
        }
    };
    VideoActivity.prototype.configure_audio = function (enable) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdpbGlvLXZpZGVvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdpbGlvLXZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esb0RBQXNEO0FBR3RELCtEQUEwRTtBQUcxRSxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFJakMsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7QUFDaEQsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztBQUMzRCxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDN0MsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3JDLElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztBQUNyRCxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7QUFDekQsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQy9DLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztBQUN2RCxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7QUFDdkQsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO0FBQ3pELElBQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUN6RCxJQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDakQsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ25DLElBQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztBQUUvQztJQW1CSTtRQUNJLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDaEcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRUQsc0JBQUksaUNBQU07YUFBVjtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXhCLENBQUM7OztPQUFBO0lBRU0saURBQXlCLEdBQWhDO1FBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckgsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzNHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUUxRCxDQUFDO0lBRU0sMENBQWtCLEdBQXpCO1FBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFFdkIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRS9DLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXhDLENBQUM7SUFFTCxDQUFDO0lBSU0sdUNBQWUsR0FBdEIsVUFBdUIsVUFBVTtRQUU3QixJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFekMsQ0FBQztJQUVNLDJDQUFtQixHQUExQjtRQUVJLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUcvQixDQUFDO0lBRU0sMkNBQW1CLEdBQTFCO0lBTUEsQ0FBQztJQUVNLHVDQUFlLEdBQXRCLFVBQXVCLFFBQWdCO1FBRW5DLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0IsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU1RixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFJaEMscUJBQXFCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUVqRyxDQUFDO1FBTUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWhDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFFakcsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEVBQUUscUJBQXFCLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7SUFHdkgsQ0FBQztJQUdNLHdDQUFnQixHQUF2QixVQUF3QixLQUFhO1FBRWpDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBRTdCLENBQUM7SUFFTSw0Q0FBb0IsR0FBM0I7UUFFSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztJQUNoQyxDQUFDO0lBRU0scURBQTZCLEdBQXBDLFVBQXFDLElBQUk7UUFFckMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRWxDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUVuRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFFMUMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5QixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFMUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVsRSxDQUFDO1lBTUQsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBRXhELENBQUM7SUFLTCxDQUFDO0lBRU0sK0NBQXVCLEdBQTlCLFVBQStCLFdBQVc7UUFFdEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVyQyxDQUFDO0lBR00sb0NBQVksR0FBbkI7UUFDSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEIsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNyQixXQUFXLFlBQUMsSUFBSTtnQkFFWixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLGFBQWE7d0JBQ3hCLE1BQU0sRUFBRSx1QkFBVSxDQUFDOzRCQUNmLElBQUksRUFBRSxJQUFJOzRCQUNWLE1BQU0sRUFBRSxRQUFRO3lCQUNuQixDQUFDO3FCQUNMLENBQUMsQ0FBQTtnQkFDTixDQUFDO1lBQ0wsQ0FBQztZQUNELGdCQUFnQixZQUFDLElBQUksRUFBRSxLQUFLO2dCQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVuQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLGtCQUFrQjt3QkFDN0IsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsSUFBSSxFQUFFLElBQUk7NEJBQ1YsS0FBSyxFQUFFLEtBQUs7eUJBQ2YsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxjQUFjLFlBQUMsSUFBSSxFQUFFLEtBQUs7Z0JBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBUW5ELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUsZ0JBQWdCO3dCQUMzQixNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixJQUFJLEVBQUUsSUFBSTs0QkFDVixLQUFLLEVBQUUsS0FBSzt5QkFDZixDQUFDO3FCQUNMLENBQUMsQ0FBQTtnQkFDTixDQUFDO1lBQ0wsQ0FBQztZQUNELHNCQUFzQixZQUFDLElBQUksRUFBRSxXQUFXO2dCQUVwQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLHdCQUF3Qjt3QkFDbkMsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsSUFBSSxFQUFFLElBQUk7NEJBQ1YsV0FBVyxFQUFFLFdBQVc7eUJBQzNCLENBQUM7cUJBQ0wsQ0FBQyxDQUFBO2dCQUNOLENBQUM7WUFDTCxDQUFDO1lBQ0QseUJBQXlCLFlBQUMsSUFBSSxFQUFFLFdBQVc7Z0JBRXZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUsMkJBQTJCO3dCQUN0QyxNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixJQUFJLEVBQUUsSUFBSTs0QkFDVixXQUFXLEVBQUUsV0FBVzt5QkFDM0IsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxrQkFBa0IsWUFBQyxJQUFJO2dCQUtuQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLG9CQUFvQjt3QkFDL0IsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsSUFBSSxFQUFFLElBQUk7eUJBQ2IsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxrQkFBa0IsWUFBQyxJQUFJO2dCQUNuQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLG9CQUFvQjt3QkFDL0IsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsSUFBSSxFQUFFLElBQUk7eUJBQ2IsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7U0FFSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sMkNBQW1CLEdBQTFCO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDNUIsaUJBQWlCLFlBQUMsV0FBVyxFQUFFLFVBQVU7Z0JBQ3JDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUsbUJBQW1CO3dCQUM5QixNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixXQUFXLEVBQUUsV0FBVzt5QkFDM0IsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxtQkFBbUIsWUFBQyxXQUFXLEVBQUUsVUFBVTtnQkFDdkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7d0JBQ2hCLFNBQVMsRUFBRSxxQkFBcUI7d0JBQ2hDLE1BQU0sRUFBRSx1QkFBVSxDQUFDOzRCQUNmLFdBQVcsRUFBRSxXQUFXO3lCQUMzQixDQUFDO3FCQUNMLENBQUMsQ0FBQTtnQkFDTixDQUFDO1lBQ0wsQ0FBQztZQUNELGlCQUFpQixZQUFDLFdBQVcsRUFBRSxVQUFVO2dCQUNyQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLG1CQUFtQjt3QkFDOUIsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsV0FBVyxFQUFFLFdBQVc7NEJBQ3hCLFVBQVUsRUFBRSxVQUFVO3lCQUN6QixDQUFDO3FCQUNMLENBQUMsQ0FBQTtnQkFDTixDQUFDO1lBQ0wsQ0FBQztZQUNELG1CQUFtQixZQUFDLFdBQVcsRUFBRSxVQUFVO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLHFCQUFxQjt3QkFDaEMsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsV0FBVyxFQUFFLFdBQVc7eUJBQzNCLENBQUM7cUJBQ0wsQ0FBQyxDQUFBO2dCQUNOLENBQUM7WUFDTCxDQUFDO1lBQ0QsbUJBQW1CLFlBQUMsV0FBVyxFQUFFLFVBQVU7Z0JBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUscUJBQXFCO3dCQUNoQyxNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixXQUFXLEVBQUUsV0FBVzs0QkFDeEIsVUFBVSxFQUFFLFVBQVU7eUJBQ3pCLENBQUM7cUJBQ0wsQ0FBQyxDQUFBO2dCQUNOLENBQUM7WUFDTCxDQUFDO1lBQ0Qsb0JBQW9CLFlBQUMsV0FBVyxFQUFFLFVBQVU7Z0JBQ3hDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUsc0JBQXNCO3dCQUNqQyxNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixXQUFXLEVBQUUsV0FBVzs0QkFDeEIsVUFBVSxFQUFFLFVBQVU7eUJBQ3pCLENBQUM7cUJBQ0wsQ0FBQyxDQUFBO2dCQUNOLENBQUM7WUFDTCxDQUFDO1lBQ0QsbUJBQW1CLFlBQUMsV0FBVyxFQUFFLFVBQVU7Z0JBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUscUJBQXFCO3dCQUNoQyxNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixXQUFXLEVBQUUsV0FBVzt5QkFDM0IsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxvQkFBb0IsWUFBQyxXQUFXLEVBQUUsVUFBVTtnQkFDeEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7d0JBQ2hCLFNBQVMsRUFBRSxzQkFBc0I7d0JBQ2pDLE1BQU0sRUFBRSx1QkFBVSxDQUFDOzRCQUNmLFdBQVcsRUFBRSxXQUFXO3lCQUMzQixDQUFDO3FCQUNMLENBQUMsQ0FBQTtnQkFDTixDQUFDO1lBQ0wsQ0FBQztTQUVKLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHTSxzQ0FBYyxHQUFyQixVQUFzQixXQUFnQjtRQUdsQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxFLENBQUM7UUFNRCxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7SUFFeEQsQ0FBQztJQUtNLDJDQUFtQixHQUExQixVQUEyQixVQUFVO1FBQ2pDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTSx5Q0FBaUIsR0FBeEIsVUFBeUIsV0FBVztRQUloQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFDRCxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxDLENBQUM7SUFFTSw4Q0FBc0IsR0FBN0IsVUFBOEIsVUFBVTtRQUNwQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBT00sMENBQWtCLEdBQXpCO1FBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFFdkIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRWhELElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpDLENBQUM7SUFFTCxDQUFDO0lBRU0sdUNBQWUsR0FBdEIsVUFBdUIsTUFBZTtRQUVsQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRVQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7WUFHckQsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBU2xILElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBTTlELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDbkUsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUvQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFckUsQ0FBQztJQUNMLENBQUM7SUFJTCxvQkFBQztBQUFELENBQUMsQUE1YkQsSUE0YkM7QUE1Ylksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3IH0gZnJvbSAndWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5pbXBvcnQgeyBSZW1vdGVWaWRlbyB9IGZyb20gXCIuL3JlbW90ZVZpZGVvXCI7XG5pbXBvcnQgeyBMb2NhbFZpZGVvIH0gZnJvbSBcIi4vbG9jYWxWaWRlb1wiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbU9iamVjdCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZGF0YS9vYnNlcnZhYmxlJztcbmltcG9ydCB7IFZpZGVvQWN0aXZpdHlCYXNlIH0gZnJvbSBcIi4uL3R3aWxpby1jb21tb25cIjtcblxudmFyIGFwcCA9IHJlcXVpcmUoXCJhcHBsaWNhdGlvblwiKTtcblxuZGVjbGFyZSB2YXIgY29tLCBhbmRyb2lkOiBhbnk7XG5cbmNvbnN0IEF1ZGlvTWFuYWdlciA9IGFuZHJvaWQubWVkaWEuQXVkaW9NYW5hZ2VyO1xuY29uc3QgTG9jYWxQYXJ0aWNpcGFudCA9IGNvbS50d2lsaW8udmlkZW8uTG9jYWxQYXJ0aWNpcGFudDtcbmNvbnN0IFJvb21TdGF0ZSA9IGNvbS50d2lsaW8udmlkZW8uUm9vbVN0YXRlO1xuY29uc3QgVmlkZW8gPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvO1xuY29uc3QgVmlkZW9SZW5kZXJlciA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9SZW5kZXJlcjtcbmNvbnN0IFR3aWxpb0V4Y2VwdGlvbiA9IGNvbS50d2lsaW8udmlkZW8uVHdpbGlvRXhjZXB0aW9uO1xuY29uc3QgQXVkaW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uQXVkaW9UcmFjaztcbmNvbnN0IENhbWVyYUNhcHR1cmVyID0gY29tLnR3aWxpby52aWRlby5DYW1lcmFDYXB0dXJlcjtcbmNvbnN0IENvbm5lY3RPcHRpb25zID0gY29tLnR3aWxpby52aWRlby5Db25uZWN0T3B0aW9ucztcbmNvbnN0IExvY2FsQXVkaW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uTG9jYWxBdWRpb1RyYWNrO1xuY29uc3QgTG9jYWxWaWRlb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbFZpZGVvVHJhY2s7XG5jb25zdCBQYXJ0aWNpcGFudCA9IGNvbS50d2lsaW8udmlkZW8uUGFydGljaXBhbnQ7XG5jb25zdCBSb29tID0gY29tLnR3aWxpby52aWRlby5Sb29tO1xuY29uc3QgVmlkZW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9UcmFjaztcblxuZXhwb3J0IGNsYXNzIFZpZGVvQWN0aXZpdHkgaW1wbGVtZW50cyBWaWRlb0FjdGl2aXR5QmFzZSB7XG5cbiAgICBwdWJsaWMgcHJldmlvdXNBdWRpb01vZGU6IGFueTtcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1ZpZXc6IGFueTtcbiAgICBwdWJsaWMgcmVtb3RlVmlkZW9WaWV3OiBhbnk7XG4gICAgcHVibGljIGxvY2FsVmlkZW9UcmFjazogYW55O1xuICAgIHB1YmxpYyBsb2NhbEF1ZGlvVHJhY2s6IGFueTtcbiAgICBwdWJsaWMgY2FtZXJhQ2FwdHVyZXI6IGFueTtcbiAgICBwdWJsaWMgYWNjZXNzVG9rZW46IHN0cmluZztcbiAgICBwdWJsaWMgVFdJTElPX0FDQ0VTU19UT0tFTjogc3RyaW5nO1xuICAgIHB1YmxpYyByb29tT2JqOiBhbnk7XG4gICAgcHVibGljIHByZXZpb3VzTWljcm9waG9uZU11dGU6IGJvb2xlYW47XG4gICAgcHVibGljIGxvY2FsUGFydGljaXBhbnQ6IGFueTtcbiAgICBwdWJsaWMgYXVkaW9NYW5hZ2VyOiBhbnk7XG4gICAgcHJpdmF0ZSBfZXZlbnRzOiBPYnNlcnZhYmxlO1xuICAgIHByaXZhdGUgX3Jvb21MaXN0ZW5lcjogYW55O1xuICAgIHByaXZhdGUgX3BhcnRpY2lwYW50TGlzdGVuZXI6IGFueTtcbiAgICBwdWJsaWMgcGFydGljaXBhbnQ6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlciA9IGFwcC5hbmRyb2lkLmNvbnRleHQuZ2V0U3lzdGVtU2VydmljZShhbmRyb2lkLmNvbnRlbnQuQ29udGV4dC5BVURJT19TRVJWSUNFKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gbmV3IE9ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICBnZXQgZXZlbnRzKCk6IE9ic2VydmFibGUge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudHM7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlQXVkaW9BbmRWaWRlb1RyYWNrcygpIHtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbFZpZGVvVHJhY2spIHJldHVybjtcblxuICAgICAgICB0aGlzLmxvY2FsVmlkZW9WaWV3LnNldE1pcnJvcih0cnVlKTtcbiAgICAgICAgdGhpcy5sb2NhbEF1ZGlvVHJhY2sgPSBMb2NhbEF1ZGlvVHJhY2suY3JlYXRlKHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlKTtcbiAgICAgICAgdGhpcy5jYW1lcmFDYXB0dXJlciA9IG5ldyBDYW1lcmFDYXB0dXJlcih1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlLkZST05UX0NBTUVSQSk7XG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gTG9jYWxWaWRlb1RyYWNrLmNyZWF0ZSh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgdHJ1ZSwgdGhpcy5jYW1lcmFDYXB0dXJlcik7XG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLmFkZFJlbmRlcmVyKHRoaXMubG9jYWxWaWRlb1ZpZXcpO1xuXG4gICAgfVxuXG4gICAgcHVibGljIHRvZ2dsZV9sb2NhbF92aWRlbygpIHtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbFZpZGVvVHJhY2spIHtcblxuICAgICAgICAgICAgbGV0IGVuYWJsZSA9ICF0aGlzLmxvY2FsVmlkZW9UcmFjay5pc0VuYWJsZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2suZW5hYmxlKGVuYWJsZSk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG5cblxuICAgIHB1YmxpYyBhZGRfdmlkZW9fdHJhY2sodmlkZW9UcmFjaykge1xuXG4gICAgICAgIHRoaXMuYWRkUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95X2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLnJlbW92ZVJlbmRlcmVyKHRoaXMubG9jYWxWaWRlb1ZpZXcpO1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gbnVsbFxuXG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveV9sb2NhbF9hdWRpbygpIHtcblxuICAgICAgICAvLyB0aGlzLmxvY2FsQXVkaW9UcmFjay5yZW1vdmVSZW5kZXJlcigpO1xuXG4gICAgICAgIC8vIHRoaXMubG9jYWxBdWRpb1RyYWNrID0gbnVsbFxuXG4gICAgfVxuXG4gICAgcHVibGljIGNvbm5lY3RfdG9fcm9vbShyb29tTmFtZTogc3RyaW5nKSB7XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmVfYXVkaW8odHJ1ZSk7XG5cbiAgICAgICAgbGV0IGNvbm5lY3RPcHRpb25zQnVpbGRlciA9IG5ldyBDb25uZWN0T3B0aW9ucy5CdWlsZGVyKHRoaXMuYWNjZXNzVG9rZW4pLnJvb21OYW1lKHJvb21OYW1lKTtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbEF1ZGlvVHJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAqIEFkZCBsb2NhbCBhdWRpbyB0cmFjayB0byBjb25uZWN0IG9wdGlvbnMgdG8gc2hhcmUgd2l0aCBwYXJ0aWNpcGFudHMuXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29ubmVjdE9wdGlvbnNCdWlsZGVyLmF1ZGlvVHJhY2tzKGphdmEudXRpbC5Db2xsZWN0aW9ucy5zaW5nbGV0b25MaXN0KHRoaXMubG9jYWxBdWRpb1RyYWNrKSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEFkZCBsb2NhbCB2aWRlbyB0cmFjayB0byBjb25uZWN0IG9wdGlvbnMgdG8gc2hhcmUgd2l0aCBwYXJ0aWNpcGFudHMuXG4gICAgICAgICAqL1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjayAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICBjb25uZWN0T3B0aW9uc0J1aWxkZXIudmlkZW9UcmFja3MoamF2YS51dGlsLkNvbGxlY3Rpb25zLnNpbmdsZXRvbkxpc3QodGhpcy5sb2NhbFZpZGVvVHJhY2spKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yb29tT2JqID0gVmlkZW8uY29ubmVjdCh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgY29ubmVjdE9wdGlvbnNCdWlsZGVyLmJ1aWxkKCksIHRoaXMucm9vbUxpc3RlbmVyKCkpO1xuXG5cbiAgICB9XG5cblxuICAgIHB1YmxpYyBzZXRfYWNjZXNzX3Rva2VuKHRva2VuOiBzdHJpbmcpIHtcblxuICAgICAgICB0aGlzLmFjY2Vzc1Rva2VuID0gdG9rZW47XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZGlzY29ubmVjdF9mcm9tX3Jvb20oKSB7XG4gICAgICAgIC8vIGxvY2FsUGFydGljaXBhbnRcbiAgICAgICAgaWYgKCF0aGlzLmxvY2FsUGFydGljaXBhbnQpIHJldHVybjtcbiAgICAgICAgdGhpcy5sb2NhbFBhcnRpY2lwYW50LnJlbW92ZVZpZGVvVHJhY2sodGhpcy5sb2NhbFZpZGVvVHJhY2spO1xuICAgICAgICB0aGlzLmxvY2FsUGFydGljaXBhbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5yZWxlYXNlKCk7XG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0X2xpc3RlbmVyX2Zvcl9wYXJ0aWNpcGFudHMocm9vbSkge1xuXG4gICAgICAgIHZhciBsaXN0ID0gcm9vbS5nZXRQYXJ0aWNpcGFudHMoKTtcblxuICAgICAgICB0aGlzLmxvY2FsUGFydGljaXBhbnQgPSByb29tLmdldExvY2FsUGFydGljaXBhbnQoKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3Quc2l6ZSgpOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgICAgICAgIHZhciBwYXJ0aWNpcGFudCA9IGxpc3QuZ2V0KGkpO1xuXG4gICAgICAgICAgICBpZiAocGFydGljaXBhbnQuZ2V0VmlkZW9UcmFja3MoKS5zaXplKCkgPiAwKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFkZFBhcnRpY2lwYW50VmlkZW8ocGFydGljaXBhbnQuZ2V0VmlkZW9UcmFja3MoKS5nZXQoMCkpO1xuXG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgcGFydGljaXBhbnQgZXZlbnRzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHBhcnRpY2lwYW50LnNldExpc3RlbmVyKHRoaXMucGFydGljaXBhbnRMaXN0ZW5lcigpKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2hvdWxkIHJldHVybiBuYW1lXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdhbmRyb2lkJywgcm9vbS5vYmplY3RbJ3BhcnRpY2lwYW50J10uZ2V0SWRlbnRpdHkoKSk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRfam9pbmVkX3Jvb20ocGFydGljaXBhbnQpIHtcblxuICAgICAgICB0aGlzLmFkZFBhcnRpY2lwYW50KHBhcnRpY2lwYW50KTtcblxuICAgIH1cblxuXG4gICAgcHVibGljIHJvb21MaXN0ZW5lcigpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBuZXcgUm9vbS5MaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkNvbm5lY3RlZChyb29tKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25Db25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZzogJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ29ubmVjdEZhaWx1cmUocm9vbSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgLy8gc2VsZi5jb25maWd1cmVfYXVkaW8oZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkNvbm5lY3RGYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uRGlzY29ubmVjdGVkKHJvb20sIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJEaXNjb25uZWN0ZWQgZnJvbSBcIiArIHJvb20uZ2V0TmFtZSgpKTtcbiAgICAgICAgICAgICAgICAvLyBzZWxmLnJvb20gPSBudWxsO1xuICAgICAgICAgICAgICAgIC8vIE9ubHkgcmVpbml0aWFsaXplIHRoZSBVSSBpZiBkaXNjb25uZWN0IHdhcyBub3QgY2FsbGVkIGZyb20gb25EZXN0cm95KClcbiAgICAgICAgICAgICAgICAvLyBpZiAoIWRpc2Nvbm5lY3RlZEZyb21PbkRlc3Ryb3kpIHtcbiAgICAgICAgICAgICAgICAvLyBzZWxmLmNvbmZpZ3VyZV9hdWRpbyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgLy8gICAgIGludGlhbGl6ZVVJKCk7XG4gICAgICAgICAgICAgICAgLy8gICAgIG1vdmVMb2NhbFZpZGVvVG9QcmltYXJ5VmlldygpO1xuICAgICAgICAgICAgICAgIC8vIH0gXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uRGlzY29ubmVjdGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUGFydGljaXBhbnRDb25uZWN0ZWQocm9vbSwgcGFydGljaXBhbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBzZWxmLmFkZFBhcnRpY2lwYW50KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25QYXJ0aWNpcGFudENvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblBhcnRpY2lwYW50RGlzY29ubmVjdGVkKHJvb20sIHBhcnRpY2lwYW50KSB7XG4gICAgICAgICAgICAgICAgLy8gc2VsZi5yZW1vdmVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uUGFydGljaXBhbnREaXNjb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZWNvcmRpbmdTdGFydGVkKHJvb20pIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIEluZGljYXRlcyB3aGVuIG1lZGlhIHNoYXJlZCB0byBhIFJvb20gaXMgYmVpbmcgcmVjb3JkZWQuIE5vdGUgdGhhdFxuICAgICAgICAgICAgICAgICAqIHJlY29yZGluZyBpcyBvbmx5IGF2YWlsYWJsZSBpbiBvdXIgR3JvdXAgUm9vbXMgZGV2ZWxvcGVyIHByZXZpZXcuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uUmVjb3JkaW5nU3RhcnRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUmVjb3JkaW5nU3RvcHBlZChyb29tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uUmVjb3JkaW5nU3RvcHBlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudExpc3RlbmVyKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUGFydGljaXBhbnQuTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25BdWRpb1RyYWNrQWRkZWQocGFydGljaXBhbnQsIGF1ZGlvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25BdWRpb1RyYWNrQWRkZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQXVkaW9UcmFja1JlbW92ZWQocGFydGljaXBhbnQsIGF1ZGlvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25BdWRpb1RyYWNrUmVtb3ZlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrQWRkZWQocGFydGljaXBhbnQsIHZpZGVvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25WaWRlb1RyYWNrQWRkZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW9UcmFjazogdmlkZW9UcmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrUmVtb3ZlZChwYXJ0aWNpcGFudCwgdmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tSZW1vdmVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tFbmFibGVkKHBhcnRpY2lwYW50LCBhdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQXVkaW9UcmFja0VuYWJsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9UcmFjazogYXVkaW9UcmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BdWRpb1RyYWNrRGlzYWJsZWQocGFydGljaXBhbnQsIGF1ZGlvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25BdWRpb1RyYWNrRGlzYWJsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9UcmFjazogYXVkaW9UcmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrRW5hYmxlZChwYXJ0aWNpcGFudCwgVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tFbmFibGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tEaXNhYmxlZChwYXJ0aWNpcGFudCwgVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tEaXNhYmxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYWRkUGFydGljaXBhbnQocGFydGljaXBhbnQ6IGFueSkge1xuXG5cbiAgICAgICAgaWYgKHBhcnRpY2lwYW50LmdldFZpZGVvVHJhY2tzKCkuc2l6ZSgpID4gMCkge1xuXG4gICAgICAgICAgICB0aGlzLmFkZFBhcnRpY2lwYW50VmlkZW8ocGFydGljaXBhbnQuZ2V0VmlkZW9UcmFja3MoKS5nZXQoMCkpO1xuXG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgcGFydGljaXBhbnQgZXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICBwYXJ0aWNpcGFudC5zZXRMaXN0ZW5lcih0aGlzLnBhcnRpY2lwYW50TGlzdGVuZXIoKSk7XG5cbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFNldCBwcmltYXJ5IHZpZXcgYXMgcmVuZGVyZXIgZm9yIHBhcnRpY2lwYW50IHZpZGVvIHRyYWNrXG4gICAgICovXG4gICAgcHVibGljIGFkZFBhcnRpY2lwYW50VmlkZW8odmlkZW9UcmFjaykge1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9WaWV3LnNldE1pcnJvcihmYWxzZSk7XG4gICAgICAgIHZpZGVvVHJhY2suYWRkUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBSZW1vdmUgcGFydGljaXBhbnQgcmVuZGVyZXJcbiAgICAgICAgICovXG4gICAgICAgIGlmIChwYXJ0aWNpcGFudC5nZXRWaWRlb1RyYWNrcygpLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlUGFydGljaXBhbnRWaWRlbyhwYXJ0aWNpcGFudC5nZXRWaWRlb1RyYWNrcygpLmdldCgwKSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFydGljaXBhbnQuc2V0TGlzdGVuZXIobnVsbCk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKSB7XG4gICAgICAgIHZpZGVvVHJhY2sucmVtb3ZlUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGN1cnJlbnRseSBub3QgdXNpbmcgdG9nZ2xlX2xvY2FsX2F1ZGlvXG4gICAgICogbm90IHN1cmUgaWYgaXRzIGJldHRlciB0byB1c2UgdGhpcyBtZXRob2Qgb3IgY29uZmlndXJlX2F1ZGlvXG4gICAgICovXG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX2F1ZGlvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsQXVkaW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlZCA9ICF0aGlzLmxvY2FsQXVkaW9UcmFjay5pc0VuYWJsZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5sb2NhbEF1ZGlvVHJhY2suZW5hYmxlKGVuYWJsZWQpO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHB1YmxpYyBjb25maWd1cmVfYXVkaW8oZW5hYmxlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGVuYWJsZSkge1xuXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzQXVkaW9Nb2RlID0gdGhpcy5hdWRpb01hbmFnZXIuZ2V0TW9kZSgpO1xuXG4gICAgICAgICAgICAvLyBSZXF1ZXN0IGF1ZGlvIGZvY3VzIGJlZm9yZSBtYWtpbmcgYW55IGRldmljZSBzd2l0Y2guXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5yZXF1ZXN0QXVkaW9Gb2N1cyhudWxsLCBBdWRpb01hbmFnZXIuU1RSRUFNX1ZPSUNFX0NBTEwsIEF1ZGlvTWFuYWdlci5BVURJT0ZPQ1VTX0dBSU5fVFJBTlNJRU5UKTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIFVzZSBNT0RFX0lOX0NPTU1VTklDQVRJT04gYXMgdGhlIGRlZmF1bHQgYXVkaW8gbW9kZS4gSXQgaXMgcmVxdWlyZWRcbiAgICAgICAgICAgICAqIHRvIGJlIGluIHRoaXMgbW9kZSB3aGVuIHBsYXlvdXQgYW5kL29yIHJlY29yZGluZyBzdGFydHMgZm9yIHRoZSBiZXN0XG4gICAgICAgICAgICAgKiBwb3NzaWJsZSBWb0lQIHBlcmZvcm1hbmNlLiBTb21lIGRldmljZXMgaGF2ZSBkaWZmaWN1bHRpZXMgd2l0aFxuICAgICAgICAgICAgICogc3BlYWtlciBtb2RlIGlmIHRoaXMgaXMgbm90IHNldC5cbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNb2RlKEF1ZGlvTWFuYWdlci5NT0RFX0lOX0NPTU1VTklDQVRJT04pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogQWx3YXlzIGRpc2FibGUgbWljcm9waG9uZSBtdXRlIGR1cmluZyBhIFdlYlJUQyBjYWxsLlxuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNNaWNyb3Bob25lTXV0ZSA9IHRoaXMuYXVkaW9NYW5hZ2VyLmlzTWljcm9waG9uZU11dGUoKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1pY3JvcGhvbmVNdXRlKGZhbHNlKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNb2RlKHRoaXMucHJldmlvdXNBdWRpb01vZGUpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuYWJhbmRvbkF1ZGlvRm9jdXMobnVsbCk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5zZXRNaWNyb3Bob25lTXV0ZSh0aGlzLnByZXZpb3VzTWljcm9waG9uZU11dGUpO1xuXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG5cblxufSJdfQ==
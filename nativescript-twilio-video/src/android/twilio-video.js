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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdpbGlvLXZpZGVvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdpbGlvLXZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esb0RBQXNEO0FBR3RELCtEQUEwRTtBQUcxRSxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFJakMsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7QUFDaEQsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztBQUMzRCxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDN0MsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3JDLElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztBQUNyRCxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7QUFDekQsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQy9DLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztBQUN2RCxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7QUFDdkQsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO0FBQ3pELElBQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUN6RCxJQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDakQsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ25DLElBQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztBQUUvQztJQW1CSTtRQUNJLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDaEcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRUQsc0JBQUksaUNBQU07YUFBVjtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXhCLENBQUM7OztPQUFBO0lBRU0saURBQXlCLEdBQWhDO1FBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckgsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzNHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUUxRCxDQUFDO0lBRU0sMENBQWtCLEdBQXpCO1FBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFFdkIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRS9DLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXhDLENBQUM7SUFFTCxDQUFDO0lBSU0sdUNBQWUsR0FBdEIsVUFBdUIsVUFBVTtRQUU3QixJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFekMsQ0FBQztJQUVNLDJDQUFtQixHQUExQjtRQUVJLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUcvQixDQUFDO0lBRU0sMkNBQW1CLEdBQTFCO0lBTUEsQ0FBQztJQUVNLHVDQUFlLEdBQXRCLFVBQXVCLFFBQWdCO1FBRW5DLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0IsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU1RixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFJaEMscUJBQXFCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUVqRyxDQUFDO1FBTUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWhDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFFakcsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEVBQUUscUJBQXFCLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7SUFHdkgsQ0FBQztJQUdNLHdDQUFnQixHQUF2QixVQUF3QixLQUFhO1FBRWpDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBRTdCLENBQUM7SUFFTSw0Q0FBb0IsR0FBM0I7UUFFSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztJQUNoQyxDQUFDO0lBRU0scURBQTZCLEdBQXBDLFVBQXFDLElBQUk7UUFFckMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRWxDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUVuRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFFMUMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5QixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFMUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVsRSxDQUFDO1lBTUQsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBRXhELENBQUM7SUFLTCxDQUFDO0lBRU0sK0NBQXVCLEdBQTlCLFVBQStCLFdBQVc7UUFFdEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVyQyxDQUFDO0lBR00sb0NBQVksR0FBbkI7UUFDSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEIsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNyQixXQUFXLFlBQUMsSUFBSTtnQkFFWixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLGFBQWE7d0JBQ3hCLE1BQU0sRUFBRSx1QkFBVSxDQUFDOzRCQUNmLElBQUksRUFBRSxJQUFJOzRCQUNWLE1BQU0sRUFBRSxRQUFRO3lCQUNuQixDQUFDO3FCQUNMLENBQUMsQ0FBQTtnQkFDTixDQUFDO1lBQ0wsQ0FBQztZQUNELGdCQUFnQixZQUFDLElBQUksRUFBRSxLQUFLO2dCQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVuQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLGtCQUFrQjt3QkFDN0IsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsSUFBSSxFQUFFLElBQUk7NEJBQ1YsS0FBSyxFQUFFLEtBQUs7eUJBQ2YsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxjQUFjLFlBQUMsSUFBSSxFQUFFLEtBQUs7Z0JBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBUW5ELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUsZ0JBQWdCO3dCQUMzQixNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixJQUFJLEVBQUUsSUFBSTs0QkFDVixLQUFLLEVBQUUsS0FBSzt5QkFDZixDQUFDO3FCQUNMLENBQUMsQ0FBQTtnQkFDTixDQUFDO1lBQ0wsQ0FBQztZQUNELHNCQUFzQixZQUFDLElBQUksRUFBRSxXQUFXO2dCQUVwQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLHdCQUF3Qjt3QkFDbkMsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsSUFBSSxFQUFFLElBQUk7NEJBQ1YsV0FBVyxFQUFFLFdBQVc7eUJBQzNCLENBQUM7cUJBQ0wsQ0FBQyxDQUFBO2dCQUNOLENBQUM7WUFDTCxDQUFDO1lBQ0QseUJBQXlCLFlBQUMsSUFBSSxFQUFFLFdBQVc7Z0JBRXZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUsMkJBQTJCO3dCQUN0QyxNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixJQUFJLEVBQUUsSUFBSTs0QkFDVixXQUFXLEVBQUUsV0FBVzt5QkFDM0IsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxrQkFBa0IsWUFBQyxJQUFJO2dCQUtuQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLG9CQUFvQjt3QkFDL0IsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsSUFBSSxFQUFFLElBQUk7eUJBQ2IsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxrQkFBa0IsWUFBQyxJQUFJO2dCQUNuQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLG9CQUFvQjt3QkFDL0IsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsSUFBSSxFQUFFLElBQUk7eUJBQ2IsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7U0FFSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sMkNBQW1CLEdBQTFCO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDNUIsaUJBQWlCLFlBQUMsV0FBVyxFQUFFLFVBQVU7Z0JBQ3JDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUsbUJBQW1CO3dCQUM5QixNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixXQUFXLEVBQUUsV0FBVzt5QkFDM0IsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxtQkFBbUIsWUFBQyxXQUFXLEVBQUUsVUFBVTtnQkFDdkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7d0JBQ2hCLFNBQVMsRUFBRSxxQkFBcUI7d0JBQ2hDLE1BQU0sRUFBRSx1QkFBVSxDQUFDOzRCQUNmLFdBQVcsRUFBRSxXQUFXO3lCQUMzQixDQUFDO3FCQUNMLENBQUMsQ0FBQTtnQkFDTixDQUFDO1lBQ0wsQ0FBQztZQUNELGlCQUFpQixZQUFDLFdBQVcsRUFBRSxVQUFVO2dCQUNyQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLG1CQUFtQjt3QkFDOUIsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsV0FBVyxFQUFFLFdBQVc7NEJBQ3hCLFVBQVUsRUFBRSxVQUFVO3lCQUN6QixDQUFDO3FCQUNMLENBQUMsQ0FBQTtnQkFDTixDQUFDO1lBQ0wsQ0FBQztZQUNELG1CQUFtQixZQUFDLFdBQVcsRUFBRSxVQUFVO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEIsU0FBUyxFQUFFLHFCQUFxQjt3QkFDaEMsTUFBTSxFQUFFLHVCQUFVLENBQUM7NEJBQ2YsV0FBVyxFQUFFLFdBQVc7eUJBQzNCLENBQUM7cUJBQ0wsQ0FBQyxDQUFBO2dCQUNOLENBQUM7WUFDTCxDQUFDO1lBQ0QsbUJBQW1CLFlBQUMsV0FBVyxFQUFFLFVBQVU7Z0JBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUscUJBQXFCO3dCQUNoQyxNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixXQUFXLEVBQUUsV0FBVzs0QkFDeEIsVUFBVSxFQUFFLFVBQVU7eUJBQ3pCLENBQUM7cUJBQ0wsQ0FBQyxDQUFBO2dCQUNOLENBQUM7WUFDTCxDQUFDO1lBQ0Qsb0JBQW9CLFlBQUMsV0FBVyxFQUFFLFVBQVU7Z0JBQ3hDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUsc0JBQXNCO3dCQUNqQyxNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixXQUFXLEVBQUUsV0FBVzs0QkFDeEIsVUFBVSxFQUFFLFVBQVU7eUJBQ3pCLENBQUM7cUJBQ0wsQ0FBQyxDQUFBO2dCQUNOLENBQUM7WUFDTCxDQUFDO1lBQ0QsbUJBQW1CLFlBQUMsV0FBVyxFQUFFLFVBQVU7Z0JBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO3dCQUNoQixTQUFTLEVBQUUscUJBQXFCO3dCQUNoQyxNQUFNLEVBQUUsdUJBQVUsQ0FBQzs0QkFDZixXQUFXLEVBQUUsV0FBVzt5QkFDM0IsQ0FBQztxQkFDTCxDQUFDLENBQUE7Z0JBQ04sQ0FBQztZQUNMLENBQUM7WUFDRCxvQkFBb0IsWUFBQyxXQUFXLEVBQUUsVUFBVTtnQkFDeEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7d0JBQ2hCLFNBQVMsRUFBRSxzQkFBc0I7d0JBQ2pDLE1BQU0sRUFBRSx1QkFBVSxDQUFDOzRCQUNmLFdBQVcsRUFBRSxXQUFXO3lCQUMzQixDQUFDO3FCQUNMLENBQUMsQ0FBQTtnQkFDTixDQUFDO1lBQ0wsQ0FBQztTQUVKLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHTSxzQ0FBYyxHQUFyQixVQUFzQixXQUFnQjtRQUdsQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxFLENBQUM7UUFNRCxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7SUFFeEQsQ0FBQztJQUtNLDJDQUFtQixHQUExQixVQUEyQixVQUFVO1FBQ2pDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTSx5Q0FBaUIsR0FBeEIsVUFBeUIsV0FBVztRQUloQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFDRCxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxDLENBQUM7SUFFTSw4Q0FBc0IsR0FBN0IsVUFBOEIsVUFBVTtRQUNwQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBT00sMENBQWtCLEdBQXpCO1FBRUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFFdkIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRWhELElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpDLENBQUM7SUFFTCxDQUFDO0lBRU0sdUNBQWUsR0FBdEIsVUFBdUIsTUFBZTtRQUVsQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRVQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7WUFHckQsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBU2xILElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBTTlELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDbkUsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUvQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFckUsQ0FBQztJQUNMLENBQUM7SUFFTCxvQkFBQztBQUFELENBQUMsQUExYkQsSUEwYkM7QUExYlksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3IH0gZnJvbSAndWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5pbXBvcnQgeyBSZW1vdGVWaWRlbyB9IGZyb20gXCIuL3JlbW90ZVZpZGVvXCI7XG5pbXBvcnQgeyBMb2NhbFZpZGVvIH0gZnJvbSBcIi4vbG9jYWxWaWRlb1wiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbU9iamVjdCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZGF0YS9vYnNlcnZhYmxlJztcbmltcG9ydCB7IFZpZGVvQWN0aXZpdHlCYXNlIH0gZnJvbSBcIi4uL3R3aWxpby1jb21tb25cIjtcblxudmFyIGFwcCA9IHJlcXVpcmUoXCJhcHBsaWNhdGlvblwiKTtcblxuZGVjbGFyZSB2YXIgY29tLCBhbmRyb2lkOiBhbnk7XG5cbmNvbnN0IEF1ZGlvTWFuYWdlciA9IGFuZHJvaWQubWVkaWEuQXVkaW9NYW5hZ2VyO1xuY29uc3QgTG9jYWxQYXJ0aWNpcGFudCA9IGNvbS50d2lsaW8udmlkZW8uTG9jYWxQYXJ0aWNpcGFudDtcbmNvbnN0IFJvb21TdGF0ZSA9IGNvbS50d2lsaW8udmlkZW8uUm9vbVN0YXRlO1xuY29uc3QgVmlkZW8gPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvO1xuY29uc3QgVmlkZW9SZW5kZXJlciA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9SZW5kZXJlcjtcbmNvbnN0IFR3aWxpb0V4Y2VwdGlvbiA9IGNvbS50d2lsaW8udmlkZW8uVHdpbGlvRXhjZXB0aW9uO1xuY29uc3QgQXVkaW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uQXVkaW9UcmFjaztcbmNvbnN0IENhbWVyYUNhcHR1cmVyID0gY29tLnR3aWxpby52aWRlby5DYW1lcmFDYXB0dXJlcjtcbmNvbnN0IENvbm5lY3RPcHRpb25zID0gY29tLnR3aWxpby52aWRlby5Db25uZWN0T3B0aW9ucztcbmNvbnN0IExvY2FsQXVkaW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uTG9jYWxBdWRpb1RyYWNrO1xuY29uc3QgTG9jYWxWaWRlb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbFZpZGVvVHJhY2s7XG5jb25zdCBQYXJ0aWNpcGFudCA9IGNvbS50d2lsaW8udmlkZW8uUGFydGljaXBhbnQ7XG5jb25zdCBSb29tID0gY29tLnR3aWxpby52aWRlby5Sb29tO1xuY29uc3QgVmlkZW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9UcmFjaztcblxuZXhwb3J0IGNsYXNzIFZpZGVvQWN0aXZpdHkgaW1wbGVtZW50cyBWaWRlb0FjdGl2aXR5QmFzZSB7XG5cbiAgICBwdWJsaWMgcHJldmlvdXNBdWRpb01vZGU6IGFueTtcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1ZpZXc6IGFueTsgXG4gICAgcHVibGljIHJlbW90ZVZpZGVvVmlldzogYW55OyBcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1RyYWNrOiBhbnk7XG4gICAgcHVibGljIGxvY2FsQXVkaW9UcmFjazogYW55O1xuICAgIHB1YmxpYyBjYW1lcmFDYXB0dXJlcjogYW55O1xuICAgIHB1YmxpYyBhY2Nlc3NUb2tlbjogc3RyaW5nO1xuICAgIHB1YmxpYyBUV0lMSU9fQUNDRVNTX1RPS0VOOiBzdHJpbmc7XG4gICAgcHVibGljIHJvb21PYmo6IHN0cmluZztcbiAgICBwdWJsaWMgcHJldmlvdXNNaWNyb3Bob25lTXV0ZTogYm9vbGVhbjtcbiAgICBwdWJsaWMgbG9jYWxQYXJ0aWNpcGFudDogYW55O1xuICAgIHB1YmxpYyBhdWRpb01hbmFnZXI6IGFueTtcbiAgICBwcml2YXRlIF9ldmVudHM6IE9ic2VydmFibGU7XG4gICAgcHJpdmF0ZSBfcm9vbUxpc3RlbmVyOiBhbnk7XG4gICAgcHJpdmF0ZSBfcGFydGljaXBhbnRMaXN0ZW5lcjogYW55O1xuICAgIHB1YmxpYyBwYXJ0aWNpcGFudDogYW55O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyID0gYXBwLmFuZHJvaWQuY29udGV4dC5nZXRTeXN0ZW1TZXJ2aWNlKGFuZHJvaWQuY29udGVudC5Db250ZXh0LkFVRElPX1NFUlZJQ0UpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBuZXcgT2JzZXJ2YWJsZSgpO1xuICAgIH1cblxuICAgIGdldCBldmVudHMoKTogT2JzZXJ2YWJsZSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50cztcblxuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVBdWRpb0FuZFZpZGVvVHJhY2tzKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjaykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1ZpZXcuc2V0TWlycm9yKHRydWUpO1xuICAgICAgICB0aGlzLmxvY2FsQXVkaW9UcmFjayA9IExvY2FsQXVkaW9UcmFjay5jcmVhdGUodXRpbHMuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCksIHRydWUpO1xuICAgICAgICB0aGlzLmNhbWVyYUNhcHR1cmVyID0gbmV3IENhbWVyYUNhcHR1cmVyKHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCBDYW1lcmFDYXB0dXJlci5DYW1lcmFTb3VyY2UuRlJPTlRfQ0FNRVJBKTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sgPSBMb2NhbFZpZGVvVHJhY2suY3JlYXRlKHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlLCB0aGlzLmNhbWVyYUNhcHR1cmVyKTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2suYWRkUmVuZGVyZXIodGhpcy5sb2NhbFZpZGVvVmlldyk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlID0gIXRoaXMubG9jYWxWaWRlb1RyYWNrLmlzRW5hYmxlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5lbmFibGUoZW5hYmxlKTtcblxuICAgICAgICB9XG5cbiAgICB9ICBcblxuXG5cbiAgICBwdWJsaWMgYWRkX3ZpZGVvX3RyYWNrKHZpZGVvVHJhY2spIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYWRkUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95X2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLnJlbW92ZVJlbmRlcmVyKHRoaXMubG9jYWxWaWRlb1ZpZXcpO1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gbnVsbFxuICAgICAgICBcblxuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95X2xvY2FsX2F1ZGlvKCkge1xuXG4gICAgICAgIC8vIHRoaXMubG9jYWxBdWRpb1RyYWNrLnJlbW92ZVJlbmRlcmVyKCk7XG5cbiAgICAgICAgLy8gdGhpcy5sb2NhbEF1ZGlvVHJhY2sgPSBudWxsXG5cbiAgICB9ICAgICAgXG5cbiAgICBwdWJsaWMgY29ubmVjdF90b19yb29tKHJvb21OYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY29uZmlndXJlX2F1ZGlvKHRydWUpO1xuXG4gICAgICAgIGxldCBjb25uZWN0T3B0aW9uc0J1aWxkZXIgPSBuZXcgQ29ubmVjdE9wdGlvbnMuQnVpbGRlcih0aGlzLmFjY2Vzc1Rva2VuKS5yb29tTmFtZShyb29tTmFtZSk7XG5cbiAgICAgICAgaWYgKHRoaXMubG9jYWxBdWRpb1RyYWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgKiBBZGQgbG9jYWwgYXVkaW8gdHJhY2sgdG8gY29ubmVjdCBvcHRpb25zIHRvIHNoYXJlIHdpdGggcGFydGljaXBhbnRzLlxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbm5lY3RPcHRpb25zQnVpbGRlci5hdWRpb1RyYWNrcyhqYXZhLnV0aWwuQ29sbGVjdGlvbnMuc2luZ2xldG9uTGlzdCh0aGlzLmxvY2FsQXVkaW9UcmFjaykpO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICAgKiBBZGQgbG9jYWwgdmlkZW8gdHJhY2sgdG8gY29ubmVjdCBvcHRpb25zIHRvIHNoYXJlIHdpdGggcGFydGljaXBhbnRzLlxuICAgICAgICAgKi9cblxuICAgICAgICBpZiAodGhpcy5sb2NhbFZpZGVvVHJhY2sgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgY29ubmVjdE9wdGlvbnNCdWlsZGVyLnZpZGVvVHJhY2tzKGphdmEudXRpbC5Db2xsZWN0aW9ucy5zaW5nbGV0b25MaXN0KHRoaXMubG9jYWxWaWRlb1RyYWNrKSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucm9vbU9iaiA9IFZpZGVvLmNvbm5lY3QodXRpbHMuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCksIGNvbm5lY3RPcHRpb25zQnVpbGRlci5idWlsZCgpLCB0aGlzLnJvb21MaXN0ZW5lcigpKTtcblxuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgc2V0X2FjY2Vzc190b2tlbih0b2tlbjogc3RyaW5nKSB7XG5cbiAgICAgICAgdGhpcy5hY2Nlc3NUb2tlbiA9IHRva2VuO1xuXG4gICAgfVxuXG4gICAgcHVibGljIGRpc2Nvbm5lY3RfZnJvbV9yb29tKCkge1xuICAgICAgICAvLyBsb2NhbFBhcnRpY2lwYW50XG4gICAgICAgIGlmICghdGhpcy5sb2NhbFBhcnRpY2lwYW50KSByZXR1cm47XG4gICAgICAgIHRoaXMubG9jYWxQYXJ0aWNpcGFudC5yZW1vdmVWaWRlb1RyYWNrKHRoaXMubG9jYWxWaWRlb1RyYWNrKTtcbiAgICAgICAgdGhpcy5sb2NhbFBhcnRpY2lwYW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVHJhY2sucmVsZWFzZSgpO1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjayA9IG51bGw7ICAgICAgICBcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0X2xpc3RlbmVyX2Zvcl9wYXJ0aWNpcGFudHMocm9vbSkge1xuXG4gICAgICAgIHZhciBsaXN0ID0gcm9vbS5nZXRQYXJ0aWNpcGFudHMoKTtcblxuICAgICAgICB0aGlzLmxvY2FsUGFydGljaXBhbnQgPSByb29tLmdldExvY2FsUGFydGljaXBhbnQoKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3Quc2l6ZSgpOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgICAgICAgIHZhciBwYXJ0aWNpcGFudCA9IGxpc3QuZ2V0KGkpO1xuXG4gICAgICAgICAgICBpZiAocGFydGljaXBhbnQuZ2V0VmlkZW9UcmFja3MoKS5zaXplKCkgPiAwKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFkZFBhcnRpY2lwYW50VmlkZW8ocGFydGljaXBhbnQuZ2V0VmlkZW9UcmFja3MoKS5nZXQoMCkpO1xuXG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgcGFydGljaXBhbnQgZXZlbnRzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHBhcnRpY2lwYW50LnNldExpc3RlbmVyKHRoaXMucGFydGljaXBhbnRMaXN0ZW5lcigpKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2hvdWxkIHJldHVybiBuYW1lXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdhbmRyb2lkJywgcm9vbS5vYmplY3RbJ3BhcnRpY2lwYW50J10uZ2V0SWRlbnRpdHkoKSk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRfam9pbmVkX3Jvb20ocGFydGljaXBhbnQpIHtcblxuICAgICAgICB0aGlzLmFkZFBhcnRpY2lwYW50KHBhcnRpY2lwYW50KTtcblxuICAgIH1cblxuXG4gICAgcHVibGljIHJvb21MaXN0ZW5lcigpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBuZXcgUm9vbS5MaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkNvbm5lY3RlZChyb29tKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25Db25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZzogJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ29ubmVjdEZhaWx1cmUocm9vbSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgLy8gc2VsZi5jb25maWd1cmVfYXVkaW8oZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkNvbm5lY3RGYWlsdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkRpc2Nvbm5lY3RlZChyb29tLCBlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRGlzY29ubmVjdGVkIGZyb20gXCIgKyByb29tLmdldE5hbWUoKSk7XG4gICAgICAgICAgICAgICAgLy8gc2VsZi5yb29tID0gbnVsbDtcbiAgICAgICAgICAgICAgICAvLyBPbmx5IHJlaW5pdGlhbGl6ZSB0aGUgVUkgaWYgZGlzY29ubmVjdCB3YXMgbm90IGNhbGxlZCBmcm9tIG9uRGVzdHJveSgpXG4gICAgICAgICAgICAgICAgLy8gaWYgKCFkaXNjb25uZWN0ZWRGcm9tT25EZXN0cm95KSB7XG4gICAgICAgICAgICAgICAgLy8gc2VsZi5jb25maWd1cmVfYXVkaW8oZmFsc2UpO1xuICAgICAgICAgICAgICAgIC8vICAgICBpbnRpYWxpemVVSSgpO1xuICAgICAgICAgICAgICAgIC8vICAgICBtb3ZlTG9jYWxWaWRlb1RvUHJpbWFyeVZpZXcoKTtcbiAgICAgICAgICAgICAgICAvLyB9IFxuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkRpc2Nvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25QYXJ0aWNpcGFudENvbm5lY3RlZChyb29tLCBwYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgICAgIC8vIHNlbGYuYWRkUGFydGljaXBhbnQocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblBhcnRpY2lwYW50Q29ubmVjdGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblBhcnRpY2lwYW50RGlzY29ubmVjdGVkKHJvb20sIHBhcnRpY2lwYW50KSB7XG4gICAgICAgICAgICAgICAgLy8gc2VsZi5yZW1vdmVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uUGFydGljaXBhbnREaXNjb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUmVjb3JkaW5nU3RhcnRlZChyb29tKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgKiBJbmRpY2F0ZXMgd2hlbiBtZWRpYSBzaGFyZWQgdG8gYSBSb29tIGlzIGJlaW5nIHJlY29yZGVkLiBOb3RlIHRoYXRcbiAgICAgICAgICAgICAgICAgKiByZWNvcmRpbmcgaXMgb25seSBhdmFpbGFibGUgaW4gb3VyIEdyb3VwIFJvb21zIGRldmVsb3BlciBwcmV2aWV3LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblJlY29yZGluZ1N0YXJ0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZWNvcmRpbmdTdG9wcGVkKHJvb20pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25SZWNvcmRpbmdTdG9wcGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudExpc3RlbmVyKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUGFydGljaXBhbnQuTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25BdWRpb1RyYWNrQWRkZWQocGFydGljaXBhbnQsIGF1ZGlvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25BdWRpb1RyYWNrQWRkZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tSZW1vdmVkKHBhcnRpY2lwYW50LCBhdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQXVkaW9UcmFja1JlbW92ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tBZGRlZChwYXJ0aWNpcGFudCwgdmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tBZGRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWRlb1RyYWNrOiB2aWRlb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrUmVtb3ZlZChwYXJ0aWNpcGFudCwgdmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tSZW1vdmVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BdWRpb1RyYWNrRW5hYmxlZChwYXJ0aWNpcGFudCwgYXVkaW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9ldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkF1ZGlvVHJhY2tFbmFibGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvVHJhY2s6IGF1ZGlvVHJhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQXVkaW9UcmFja0Rpc2FibGVkKHBhcnRpY2lwYW50LCBhdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQXVkaW9UcmFja0Rpc2FibGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvVHJhY2s6IGF1ZGlvVHJhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uVmlkZW9UcmFja0VuYWJsZWQocGFydGljaXBhbnQsIFZpZGVvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25WaWRlb1RyYWNrRW5hYmxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrRGlzYWJsZWQocGFydGljaXBhbnQsIFZpZGVvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25WaWRlb1RyYWNrRGlzYWJsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGFkZFBhcnRpY2lwYW50KHBhcnRpY2lwYW50OiBhbnkpIHtcbiAgICAgICAgXG5cbiAgICAgICAgaWYgKHBhcnRpY2lwYW50LmdldFZpZGVvVHJhY2tzKCkuc2l6ZSgpID4gMCkge1xuXG4gICAgICAgICAgICB0aGlzLmFkZFBhcnRpY2lwYW50VmlkZW8ocGFydGljaXBhbnQuZ2V0VmlkZW9UcmFja3MoKS5nZXQoMCkpO1xuXG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgcGFydGljaXBhbnQgZXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICBwYXJ0aWNpcGFudC5zZXRMaXN0ZW5lcih0aGlzLnBhcnRpY2lwYW50TGlzdGVuZXIoKSk7XG5cbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFNldCBwcmltYXJ5IHZpZXcgYXMgcmVuZGVyZXIgZm9yIHBhcnRpY2lwYW50IHZpZGVvIHRyYWNrXG4gICAgICovXG4gICAgcHVibGljIGFkZFBhcnRpY2lwYW50VmlkZW8odmlkZW9UcmFjaykge1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9WaWV3LnNldE1pcnJvcihmYWxzZSk7XG4gICAgICAgIHZpZGVvVHJhY2suYWRkUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBSZW1vdmUgcGFydGljaXBhbnQgcmVuZGVyZXJcbiAgICAgICAgICovXG4gICAgICAgIGlmIChwYXJ0aWNpcGFudC5nZXRWaWRlb1RyYWNrcygpLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlUGFydGljaXBhbnRWaWRlbyhwYXJ0aWNpcGFudC5nZXRWaWRlb1RyYWNrcygpLmdldCgwKSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFydGljaXBhbnQuc2V0TGlzdGVuZXIobnVsbCk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKSB7IFxuICAgICAgICB2aWRlb1RyYWNrLnJlbW92ZVJlbmRlcmVyKHRoaXMucmVtb3RlVmlkZW9WaWV3KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjdXJyZW50bHkgbm90IHVzaW5nIHRvZ2dsZV9sb2NhbF9hdWRpb1xuICAgICAqIG5vdCBzdXJlIGlmIGl0cyBiZXR0ZXIgdG8gdXNlIHRoaXMgbWV0aG9kIG9yIGNvbmZpZ3VyZV9hdWRpb1xuICAgICAqL1xuXG4gICAgcHVibGljIHRvZ2dsZV9sb2NhbF9hdWRpbygpIHtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbEF1ZGlvVHJhY2spIHtcblxuICAgICAgICAgICAgbGV0IGVuYWJsZWQgPSAhdGhpcy5sb2NhbEF1ZGlvVHJhY2suaXNFbmFibGVkKCk7XG5cbiAgICAgICAgICAgIHRoaXMubG9jYWxBdWRpb1RyYWNrLmVuYWJsZShlbmFibGVkKTtcblxuICAgICAgICB9XG5cbiAgICB9ICAgIFxuXG4gICAgcHVibGljIGNvbmZpZ3VyZV9hdWRpbyhlbmFibGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZW5hYmxlKSB7XG5cbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNBdWRpb01vZGUgPSB0aGlzLmF1ZGlvTWFuYWdlci5nZXRNb2RlKCk7XG5cbiAgICAgICAgICAgIC8vIFJlcXVlc3QgYXVkaW8gZm9jdXMgYmVmb3JlIG1ha2luZyBhbnkgZGV2aWNlIHN3aXRjaC5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnJlcXVlc3RBdWRpb0ZvY3VzKG51bGwsIEF1ZGlvTWFuYWdlci5TVFJFQU1fVk9JQ0VfQ0FMTCwgQXVkaW9NYW5hZ2VyLkFVRElPRk9DVVNfR0FJTl9UUkFOU0lFTlQpO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogVXNlIE1PREVfSU5fQ09NTVVOSUNBVElPTiBhcyB0aGUgZGVmYXVsdCBhdWRpbyBtb2RlLiBJdCBpcyByZXF1aXJlZFxuICAgICAgICAgICAgICogdG8gYmUgaW4gdGhpcyBtb2RlIHdoZW4gcGxheW91dCBhbmQvb3IgcmVjb3JkaW5nIHN0YXJ0cyBmb3IgdGhlIGJlc3RcbiAgICAgICAgICAgICAqIHBvc3NpYmxlIFZvSVAgcGVyZm9ybWFuY2UuIFNvbWUgZGV2aWNlcyBoYXZlIGRpZmZpY3VsdGllcyB3aXRoXG4gICAgICAgICAgICAgKiBzcGVha2VyIG1vZGUgaWYgdGhpcyBpcyBub3Qgc2V0LlxuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1vZGUoQXVkaW9NYW5hZ2VyLk1PREVfSU5fQ09NTVVOSUNBVElPTik7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBBbHdheXMgZGlzYWJsZSBtaWNyb3Bob25lIG11dGUgZHVyaW5nIGEgV2ViUlRDIGNhbGwuXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c01pY3JvcGhvbmVNdXRlID0gdGhpcy5hdWRpb01hbmFnZXIuaXNNaWNyb3Bob25lTXV0ZSgpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0TWljcm9waG9uZU11dGUoZmFsc2UpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1vZGUodGhpcy5wcmV2aW91c0F1ZGlvTW9kZSk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5hYmFuZG9uQXVkaW9Gb2N1cyhudWxsKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1pY3JvcGhvbmVNdXRlKHRoaXMucHJldmlvdXNNaWNyb3Bob25lTXV0ZSk7XG5cbiAgICAgICAgfVxuICAgIH1cblxufSJdfQ==
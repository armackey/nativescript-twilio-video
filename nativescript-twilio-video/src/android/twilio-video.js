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
// const CameraCapturerCameraSource = com.twilio.video.CameraCapturer.CameraSource;
var ConnectOptions = com.twilio.video.ConnectOptions;
var LocalAudioTrack = com.twilio.video.LocalAudioTrack;
var LocalVideoTrack = com.twilio.video.LocalVideoTrack;
// const VideoCapturer = com.twilio.video.VideoCapturer;
var Participant = com.twilio.video.RemoteParticipant;
var Room = com.twilio.video.Room;
var VideoTrack = com.twilio.video.VideoTrack;
var VideoActivity = (function () {
    function VideoActivity() {
        this._event = new observable_1.Observable();
        /*
         * Update preferred audio and video codec in case changed in settings
         */
        // this.audioCodec = getCodecPreference(SettingsActivity.PREF_AUDIO_CODEC,
        //     SettingsActivity.PREF_AUDIO_CODEC_DEFAULT,
        //     AudioCodec.class);
        // this.videoCodec = getCodecPreference(SettingsActivity.PREF_VIDEO_CODEC,
        //     SettingsActivity.PREF_VIDEO_CODEC_DEFAULT,
        //     VideoCodec.class);        
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
        this.configure_audio(true);
        var connectOptionsBuilder = new ConnectOptions.Builder(this.accessToken).roomName(roomName);
        if (!this.localAudioTrack && options.audio) {
            app.android.foregroundActivity.setVolumeControlStream(AudioManager.STREAM_VOICE_CALL);
            this.audioManager = app.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
            this.audioManager.setSpeakerphoneOn(true);
            this.localAudioTrack = com.twilio.video.LocalAudioTrack.create(utilsModule.ad.getApplicationContext(), true, "mic");
            /*
            * Add local audio track to connect options to share with participants.
            */
            connectOptionsBuilder.audioTracks(java.util.Collections.singletonList(this.localAudioTrack));
        }
        /*
         * Add local video track to connect options to share with participants.
         */
        if (!this.localVideoTrack && options.video) {
            connectOptionsBuilder.videoTracks(java.util.Collections.singletonList(this.localVideoTrack));
        }
        /*
         * Set the preferred audio and video codec for media.
         */
        // connectOptionsBuilder.preferAudioCodecs(java.util.Collections.singletonList(audioCodec));
        // connectOptionsBuilder.preferVideoCodecs(java.util.Collections.singletonList(videoCodec));
        /*
         * Set the sender side encoding parameters.
         */
        // connectOptionsBuilder.encodingParameters(encodingParameters);
        // room = Video.connect(this, connectOptionsBuilder.build(), roomListener());
        // setDisconnectAction();        
        this.room = com.twilio.video.Video.connect(utilsModule.ad.getApplicationContext(), connectOptionsBuilder.build(), this.roomListener());
    };
    VideoActivity.prototype.startPreview = function () {
        if (this.localVideoTrack && this.localVideoTrack !== null) {
            return;
        }
        ;
        // this.cameraCapturer = new CameraCapturer(utilsModule.ad.getApplicationContext(), CameraCapturer.CameraSource.FRONT_CAMERA, this.cameraListener());
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
        /*
         * Start listening for participant events
         */
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
                // self.configure_audio(false);
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
                // self.configure_audio(false)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdpbGlvLXZpZGVvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHdpbGlvLXZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsK0RBQTBFO0FBSTFFLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUkxRCxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztBQUNoRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUN0RCxJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7QUFDMUQsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztBQUMzRCxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDN0MsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3JDLElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztBQUNyRCxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7QUFDekQsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQy9DLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztBQUN2RCxtRkFBbUY7QUFDbkYsSUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDO0FBQ3ZELElBQU0sZUFBZSxHQUFHLEdB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QUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV4QyxDQUFDO0lBRUwsQ0FBQztJQUVNLDBDQUFrQixHQUF6QjtRQUVJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBRXZCLElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUVoRCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6QyxDQUFDO0lBRUwsQ0FBQztJQUVMLG9CQUFDO0FBQUQsQ0FBQyxBQW5oQkQsSUFtaEJDO0FBbmhCWSxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZpZXcgfSBmcm9tICd1aS9jb3JlL3ZpZXcnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHNcIjtcbmltcG9ydCB7IFJlbW90ZVZpZGVvIH0gZnJvbSBcIi4vcmVtb3RlVmlkZW9cIjtcbmltcG9ydCB7IExvY2FsVmlkZW8gfSBmcm9tIFwiLi9sb2NhbFZpZGVvXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tT2JqZWN0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGUnO1xuaW1wb3J0IHsgVmlkZW9BY3Rpdml0eUJhc2UgfSBmcm9tIFwiLi4vdHdpbGlvLWNvbW1vblwiO1xuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb25cIjtcblxudmFyIGFwcCA9IHJlcXVpcmUoXCJhcHBsaWNhdGlvblwiKTtcbnZhciB1dGlsc01vZHVsZSA9IHJlcXVpcmUoXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCIpO1xuXG5kZWNsYXJlIHZhciBjb20sIGFuZHJvaWQ6IGFueTtcblxuY29uc3QgQXVkaW9NYW5hZ2VyID0gYW5kcm9pZC5tZWRpYS5BdWRpb01hbmFnZXI7XG5jb25zdCBBdWRpb0F0dHJpYnV0ZXMgPSBhbmRyb2lkLm1lZGlhLkF1ZGlvQXR0cmlidXRlcztcbmNvbnN0IEF1ZGlvRm9jdXNSZXF1ZXN0ID0gYW5kcm9pZC5tZWRpYS5BdWRpb0ZvY3VzUmVxdWVzdDtcbmNvbnN0IExvY2FsUGFydGljaXBhbnQgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsUGFydGljaXBhbnQ7XG5jb25zdCBSb29tU3RhdGUgPSBjb20udHdpbGlvLnZpZGVvLlJvb21TdGF0ZTtcbmNvbnN0IFZpZGVvID0gY29tLnR3aWxpby52aWRlby5WaWRlbztcbmNvbnN0IFZpZGVvUmVuZGVyZXIgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvUmVuZGVyZXI7XG5jb25zdCBUd2lsaW9FeGNlcHRpb24gPSBjb20udHdpbGlvLnZpZGVvLlR3aWxpb0V4Y2VwdGlvbjtcbmNvbnN0IEF1ZGlvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkF1ZGlvVHJhY2s7XG5jb25zdCBDYW1lcmFDYXB0dXJlciA9IGNvbS50d2lsaW8udmlkZW8uQ2FtZXJhQ2FwdHVyZXI7XG4vLyBjb25zdCBDYW1lcmFDYXB0dXJlckNhbWVyYVNvdXJjZSA9IGNvbS50d2lsaW8udmlkZW8uQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlO1xuY29uc3QgQ29ubmVjdE9wdGlvbnMgPSBjb20udHdpbGlvLnZpZGVvLkNvbm5lY3RPcHRpb25zO1xuY29uc3QgTG9jYWxBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbEF1ZGlvVHJhY2s7XG5jb25zdCBMb2NhbFZpZGVvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsVmlkZW9UcmFjaztcbi8vIGNvbnN0IFZpZGVvQ2FwdHVyZXIgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvQ2FwdHVyZXI7XG5jb25zdCBQYXJ0aWNpcGFudCA9IGNvbS50d2lsaW8udmlkZW8uUmVtb3RlUGFydGljaXBhbnQ7XG5jb25zdCBSb29tID0gY29tLnR3aWxpby52aWRlby5Sb29tO1xuY29uc3QgVmlkZW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9UcmFjaztcblxuZXhwb3J0IGNsYXNzIFZpZGVvQWN0aXZpdHkge1xuXG4gICAgcHVibGljIHByZXZpb3VzQXVkaW9Nb2RlOiBhbnk7XG4gICAgcHVibGljIGxvY2FsVmlkZW9WaWV3OiBhbnk7XG4gICAgcHVibGljIHJlbW90ZVZpZGVvVmlldzogYW55O1xuICAgIHB1YmxpYyBsb2NhbFZpZGVvVHJhY2s6IGFueTtcbiAgICBwdWJsaWMgbG9jYWxBdWRpb1RyYWNrOiBhbnk7XG4gICAgcHVibGljIGNhbWVyYUNhcHR1cmVyOiBhbnk7XG4gICAgcHVibGljIGNhbWVyYUNhcHR1cmVyQ29tcGF0OiBhbnk7XG4gICAgcHVibGljIGFjY2Vzc1Rva2VuOiBzdHJpbmc7XG4gICAgcHVibGljIFRXSUxJT19BQ0NFU1NfVE9LRU46IHN0cmluZztcbiAgICBwdWJsaWMgcm9vbTogYW55O1xuICAgIHB1YmxpYyBwcmV2aW91c01pY3JvcGhvbmVNdXRlOiBib29sZWFuO1xuICAgIHB1YmxpYyBsb2NhbFBhcnRpY2lwYW50OiBhbnk7XG4gICAgcHVibGljIGF1ZGlvTWFuYWdlcjogYW55O1xuICAgIHByaXZhdGUgX2V2ZW50OiBPYnNlcnZhYmxlO1xuICAgIHB1YmxpYyBwYXJ0aWNpcGFudDogYW55O1xuXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICB0aGlzLl9ldmVudCA9IG5ldyBPYnNlcnZhYmxlKCk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogVXBkYXRlIHByZWZlcnJlZCBhdWRpbyBhbmQgdmlkZW8gY29kZWMgaW4gY2FzZSBjaGFuZ2VkIGluIHNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICAvLyB0aGlzLmF1ZGlvQ29kZWMgPSBnZXRDb2RlY1ByZWZlcmVuY2UoU2V0dGluZ3NBY3Rpdml0eS5QUkVGX0FVRElPX0NPREVDLFxuICAgICAgICAvLyAgICAgU2V0dGluZ3NBY3Rpdml0eS5QUkVGX0FVRElPX0NPREVDX0RFRkFVTFQsXG4gICAgICAgIC8vICAgICBBdWRpb0NvZGVjLmNsYXNzKTtcbiAgICAgICAgLy8gdGhpcy52aWRlb0NvZGVjID0gZ2V0Q29kZWNQcmVmZXJlbmNlKFNldHRpbmdzQWN0aXZpdHkuUFJFRl9WSURFT19DT0RFQyxcbiAgICAgICAgLy8gICAgIFNldHRpbmdzQWN0aXZpdHkuUFJFRl9WSURFT19DT0RFQ19ERUZBVUxULFxuICAgICAgICAvLyAgICAgVmlkZW9Db2RlYy5jbGFzcyk7ICAgICAgICBcblxuICAgIH1cblxuICAgIGdldCBldmVudCgpOiBPYnNlcnZhYmxlIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnQ7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY29ubmVjdF90b19yb29tKHJvb21OYW1lOiBzdHJpbmcsIG9wdGlvbnM6IHsgdmlkZW86IGJvb2xlYW4sIGF1ZGlvOiBib29sZWFuIH0pIHtcblxuXG4gICAgICAgIGlmICghdGhpcy5hY2Nlc3NUb2tlbikge1xuXG4gICAgICAgICAgICB0aGlzLm9uRXJyb3IoJ1BsZWFzZSBwcm92aWRlIGEgdmFsaWQgdG9rZW4gdG8gY29ubmVjdCB0byBhIHJvb20nKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbmZpZ3VyZV9hdWRpbyh0cnVlKTtcblxuICAgICAgICBsZXQgY29ubmVjdE9wdGlvbnNCdWlsZGVyID0gbmV3IENvbm5lY3RPcHRpb25zLkJ1aWxkZXIodGhpcy5hY2Nlc3NUb2tlbikucm9vbU5hbWUocm9vbU5hbWUpO1xuXG4gICAgICAgIGlmICghdGhpcy5sb2NhbEF1ZGlvVHJhY2sgJiYgb3B0aW9ucy5hdWRpbykge1xuXG4gICAgICAgICAgICBhcHAuYW5kcm9pZC5mb3JlZ3JvdW5kQWN0aXZpdHkuc2V0Vm9sdW1lQ29udHJvbFN0cmVhbShBdWRpb01hbmFnZXIuU1RSRUFNX1ZPSUNFX0NBTEwpO1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlciA9IGFwcC5hbmRyb2lkLmNvbnRleHQuZ2V0U3lzdGVtU2VydmljZShhbmRyb2lkLmNvbnRlbnQuQ29udGV4dC5BVURJT19TRVJWSUNFKTtcblxuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0U3BlYWtlcnBob25lT24odHJ1ZSk7ICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIHRoaXMubG9jYWxBdWRpb1RyYWNrID0gY29tLnR3aWxpby52aWRlby5Mb2NhbEF1ZGlvVHJhY2suY3JlYXRlKHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCB0cnVlLCBcIm1pY1wiKTtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAqIEFkZCBsb2NhbCBhdWRpbyB0cmFjayB0byBjb25uZWN0IG9wdGlvbnMgdG8gc2hhcmUgd2l0aCBwYXJ0aWNpcGFudHMuXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29ubmVjdE9wdGlvbnNCdWlsZGVyLmF1ZGlvVHJhY2tzKGphdmEudXRpbC5Db2xsZWN0aW9ucy5zaW5nbGV0b25MaXN0KHRoaXMubG9jYWxBdWRpb1RyYWNrKSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEFkZCBsb2NhbCB2aWRlbyB0cmFjayB0byBjb25uZWN0IG9wdGlvbnMgdG8gc2hhcmUgd2l0aCBwYXJ0aWNpcGFudHMuXG4gICAgICAgICAqL1xuXG4gICAgICAgIGlmICghdGhpcy5sb2NhbFZpZGVvVHJhY2sgJiYgb3B0aW9ucy52aWRlbykge1xuXG4gICAgICAgICAgICBjb25uZWN0T3B0aW9uc0J1aWxkZXIudmlkZW9UcmFja3MoamF2YS51dGlsLkNvbGxlY3Rpb25zLnNpbmdsZXRvbkxpc3QodGhpcy5sb2NhbFZpZGVvVHJhY2spKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLypcbiAgICAgICAgICogU2V0IHRoZSBwcmVmZXJyZWQgYXVkaW8gYW5kIHZpZGVvIGNvZGVjIGZvciBtZWRpYS5cbiAgICAgICAgICovXG4gICAgICAgIC8vIGNvbm5lY3RPcHRpb25zQnVpbGRlci5wcmVmZXJBdWRpb0NvZGVjcyhqYXZhLnV0aWwuQ29sbGVjdGlvbnMuc2luZ2xldG9uTGlzdChhdWRpb0NvZGVjKSk7XG4gICAgICAgIC8vIGNvbm5lY3RPcHRpb25zQnVpbGRlci5wcmVmZXJWaWRlb0NvZGVjcyhqYXZhLnV0aWwuQ29sbGVjdGlvbnMuc2luZ2xldG9uTGlzdCh2aWRlb0NvZGVjKSk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogU2V0IHRoZSBzZW5kZXIgc2lkZSBlbmNvZGluZyBwYXJhbWV0ZXJzLlxuICAgICAgICAgKi9cbiAgICAgICAgLy8gY29ubmVjdE9wdGlvbnNCdWlsZGVyLmVuY29kaW5nUGFyYW1ldGVycyhlbmNvZGluZ1BhcmFtZXRlcnMpO1xuXG4gICAgICAgIC8vIHJvb20gPSBWaWRlby5jb25uZWN0KHRoaXMsIGNvbm5lY3RPcHRpb25zQnVpbGRlci5idWlsZCgpLCByb29tTGlzdGVuZXIoKSk7XG4gICAgICAgIC8vIHNldERpc2Nvbm5lY3RBY3Rpb24oKTsgICAgICAgIFxuXG5cbiAgICAgICAgdGhpcy5yb29tID0gY29tLnR3aWxpby52aWRlby5WaWRlby5jb25uZWN0KHV0aWxzTW9kdWxlLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpLCBjb25uZWN0T3B0aW9uc0J1aWxkZXIuYnVpbGQoKSwgdGhpcy5yb29tTGlzdGVuZXIoKSk7XG5cbiAgICB9XG5cbiAgICBzdGFydFByZXZpZXcoKTogYW55IHtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbFZpZGVvVHJhY2sgJiYgdGhpcy5sb2NhbFZpZGVvVHJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gdGhpcy5jYW1lcmFDYXB0dXJlciA9IG5ldyBDYW1lcmFDYXB0dXJlcih1dGlsc01vZHVsZS5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlLkZST05UX0NBTUVSQSwgdGhpcy5jYW1lcmFMaXN0ZW5lcigpKTtcbiAgICAgICAgdGhpcy5jYW1lcmFDYXB0dXJlciA9IG5ldyBDYW1lcmFDYXB0dXJlcih1dGlsc01vZHVsZS5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgQ2FtZXJhQ2FwdHVyZXIuQ2FtZXJhU291cmNlLkZST05UX0NBTUVSQSwgbnVsbCk7XG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gTG9jYWxWaWRlb1RyYWNrLmNyZWF0ZSh1dGlsc01vZHVsZS5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSwgdHJ1ZSwgdGhpcy5jYW1lcmFDYXB0dXJlciwgJ2NhbWVyYScpO1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5hZGRSZW5kZXJlcih0aGlzLmxvY2FsVmlkZW9WaWV3KTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVmlldy5zZXRNaXJyb3IodHJ1ZSk7XG5cbiAgICB9XG5cblxuXG4gICAgcHVibGljIGFkZFJlbW90ZVBhcnRpY2lwYW50KHJlbW90ZVBhcnRpY2lwYW50OiBhbnkpIHtcbiAgICAgICAgaWYgKHJlbW90ZVBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgbGV0IHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbiA9IHJlbW90ZVBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuZ2V0KDApO1xuICAgICAgICAgICAgaWYgKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5pc1RyYWNrU3Vic2NyaWJlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRSZW1vdGVQYXJ0aWNpcGFudFZpZGVvKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5nZXRSZW1vdGVWaWRlb1RyYWNrKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgLypcbiAgICAgICAgICogU3RhcnQgbGlzdGVuaW5nIGZvciBwYXJ0aWNpcGFudCBldmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHJlbW90ZVBhcnRpY2lwYW50LnNldExpc3RlbmVyKHRoaXMucGFydGljaXBhbnRMaXN0ZW5lcigpKTtcblxuICAgIH1cblxuXG4gICAgb25FcnJvcihyZWFzb246IHN0cmluZykge1xuICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgZXZlbnROYW1lOiAnZXJyb3InLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICByZWFzb246IHJlYXNvblxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVtb3ZlUGFydGljaXBhbnRWaWRlbyh2aWRlb1RyYWNrKSB7XG4gICAgICAgIHZpZGVvVHJhY2sucmVtb3ZlUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVSZW1vdGVQYXJ0aWNpcGFudChyZW1vdGVQYXJ0aWNpcGFudCkge1xuXG4gICAgICAgIC8vIGlmICghcmVtb3RlUGFydGljaXBhbnQuZ2V0SWRlbnRpdHkoKS5lcXVhbHMocmVtb3RlUGFydGljaXBhbnRJZGVudGl0eSkpIHtcbiAgICAgICAgLy8gICAgIHJldHVybjtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8qXG4gICAgICAgICogUmVtb3ZlIHJlbW90ZSBwYXJ0aWNpcGFudCByZW5kZXJlclxuICAgICAgICAqL1xuICAgICAgICBpZiAoIXJlbW90ZVBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICBsZXQgcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uID0gcmVtb3RlUGFydGljaXBhbnQuZ2V0UmVtb3RlVmlkZW9UcmFja3MoKS5nZXQoMCk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgKiBSZW1vdmUgdmlkZW8gb25seSBpZiBzdWJzY3JpYmVkIHRvIHBhcnRpY2lwYW50IHRyYWNrXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5pc1RyYWNrU3Vic2NyaWJlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQYXJ0aWNpcGFudFZpZGVvKHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbi5nZXRSZW1vdGVWaWRlb1RyYWNrKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFNldCBwcmltYXJ5IHZpZXcgYXMgcmVuZGVyZXIgZm9yIHBhcnRpY2lwYW50IHZpZGVvIHRyYWNrXG4gICAgICovXG4gICAgcHVibGljIGFkZFJlbW90ZVBhcnRpY2lwYW50VmlkZW8odmlkZW9UcmFjaykge1xuICAgICAgICB0aGlzLnJlbW90ZVZpZGVvVmlldy5zZXRNaXJyb3IodHJ1ZSk7XG4gICAgICAgIHZpZGVvVHJhY2suYWRkUmVuZGVyZXIodGhpcy5yZW1vdGVWaWRlb1ZpZXcpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95X2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrLnJlbW92ZVJlbmRlcmVyKHRoaXMubG9jYWxWaWRlb1ZpZXcpO1xuXG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1RyYWNrID0gbnVsbFxuXG4gICAgfVxuXG5cbiAgICBkaXNjb25uZWN0KCkge1xuXG4gICAgICAgIHRoaXMucm9vbS5kaXNjb25uZWN0KCk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY2FtZXJhTGlzdGVuZXIoKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IENhbWVyYUNhcHR1cmVyLkxpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uRmlyc3RGcmFtZUF2YWlsYWJsZSgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICd2aWRlb1ZpZXdEaWRSZWNlaXZlRGF0YScsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3OiAndmlldycsXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkVycm9yKGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9uRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcm9vbUxpc3RlbmVyKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBSb29tLkxpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQ29ubmVjdGVkKHJvb20pIHtcblxuICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gcm9vbS5nZXRSZW1vdGVQYXJ0aWNpcGFudHMoKTtcblxuICAgICAgICAgICAgICAgIHNlbGYubG9jYWxQYXJ0aWNpcGFudCA9IHJvb20uZ2V0TG9jYWxQYXJ0aWNpcGFudCgpO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnZGlkQ29ubmVjdFRvUm9vbScsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGxpc3Quc2l6ZSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5zaXplKCk7IGkgPCBsOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFydGljaXBhbnQgPSBsaXN0LmdldChpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocGFydGljaXBhbnQuZ2V0VmlkZW9UcmFja3MoKS5zaXplKCkgPiAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWRkUmVtb3RlUGFydGljaXBhbnQocGFydGljaXBhbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ29ubmVjdEZhaWx1cmUocm9vbSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBzZWxmLmNvbmZpZ3VyZV9hdWRpbyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnZGlkRmFpbFRvQ29ubmVjdFdpdGhFcnJvcicsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkRpc2Nvbm5lY3RlZChyb29tLCBlcnJvcikge1xuICAgICAgICAgICAgICAgIHNlbGYucm9vbSA9ICcnO1xuICAgICAgICAgICAgICAgIHNlbGYubG9jYWxQYXJ0aWNpcGFudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgLy8gc2VsZi5jb25maWd1cmVfYXVkaW8oZmFsc2UpXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkRpc2Nvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblBhcnRpY2lwYW50Q29ubmVjdGVkKHJvb20sIHBhcnRpY2lwYW50KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3BhcnRpY2lwYW50RGlkQ29ubmVjdCcpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlkQ29ubmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHBhcnRpY2lwYW50LmdldFJlbW90ZVZpZGVvVHJhY2tzKCkuc2l6ZSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGRSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25QYXJ0aWNpcGFudERpc2Nvbm5lY3RlZChyb29tLCBwYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlkRGlzY29ubmVjdCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVSZW1vdGVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZWNvcmRpbmdTdGFydGVkKHJvb20pIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIEluZGljYXRlcyB3aGVuIG1lZGlhIHNoYXJlZCB0byBhIFJvb20gaXMgYmVpbmcgcmVjb3JkZWQuIE5vdGUgdGhhdFxuICAgICAgICAgICAgICAgICAqIHJlY29yZGluZyBpcyBvbmx5IGF2YWlsYWJsZSBpbiBvdXIgR3JvdXAgUm9vbXMgZGV2ZWxvcGVyIHByZXZpZXcuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgLy8gaWYgKHNlbGYuX2V2ZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBldmVudE5hbWU6ICdvblJlY29yZGluZ1N0YXJ0ZWQnLFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICByb29tOiByb29tXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblJlY29yZGluZ1N0b3BwZWQocm9vbSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIChzZWxmLl9ldmVudCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgZXZlbnROYW1lOiAnb25SZWNvcmRpbmdTdG9wcGVkJyxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgcm9vbTogcm9vbVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHBhcnRpY2lwYW50TGlzdGVuZXIoKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyBQYXJ0aWNpcGFudC5MaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tQdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRQdWJsaXNoZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25BdWRpb1RyYWNrVW5wdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRVbnB1Ymxpc2hlZEF1ZGlvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tQdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRQdWJsaXNoZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25WaWRlb1RyYWNrVW5wdWJsaXNoZWQocGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRVbnB1Ymxpc2hlZFZpZGVvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tTdWJzY3JpYmVkKHJlbW90ZVBhcnRpY2lwYW50LCByZW1vdGVBdWRpb1RyYWNrUHVibGljYXRpb24sIHJlbW90ZUF1ZGlvVHJhY2spIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkF1ZGlvVHJhY2tTdWJzY3JpYmVkJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiByZW1vdGVQYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiByZW1vdGVBdWRpb1RyYWNrUHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBhdWRpb1RyYWNrOiByZW1vdGVBdWRpb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQXVkaW9UcmFja1Vuc3Vic2NyaWJlZChyZW1vdGVQYXJ0aWNpcGFudCwgcmVtb3RlQXVkaW9UcmFja1B1YmxpY2F0aW9uLCByZW1vdGVBdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25BdWRpb1RyYWNrVW5zdWJzY3JpYmVkJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiByZW1vdGVQYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiByZW1vdGVBdWRpb1RyYWNrUHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBhdWRpb1RyYWNrOiByZW1vdGVBdWRpb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uVmlkZW9UcmFja1N1YnNjcmliZWQocmVtb3RlUGFydGljaXBhbnQsIHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbiwgcmVtb3RlVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHNlbGYuYWRkUmVtb3RlUGFydGljaXBhbnRWaWRlbyhyZW1vdGVWaWRlb1RyYWNrKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uVmlkZW9UcmFja1N1YnNjcmliZWRcIilcbiAgICAgICAgICAgICAgICBzZWxmLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tTdWJzY3JpYmVkJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiByZW1vdGVQYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiByZW1vdGVWaWRlb1RyYWNrUHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWRlb1RyYWNrOiByZW1vdGVWaWRlb1RyYWNrXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tVbnN1YnNjcmliZWQocmVtb3RlUGFydGljaXBhbnQsIHJlbW90ZVZpZGVvVHJhY2tQdWJsaWNhdGlvbiwgcmVtb3RlVmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlUGFydGljaXBhbnRWaWRlbyhyZW1vdGVWaWRlb1RyYWNrKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uVmlkZW9UcmFja1Vuc3Vic2NyaWJlZFwiKVxuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uVmlkZW9UcmFja1Vuc3Vic2NyaWJlZCcsXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcmVtb3RlUGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcmVtb3RlVmlkZW9UcmFja1B1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW9UcmFjazogcmVtb3RlVmlkZW9UcmFja1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uVmlkZW9UcmFja0Rpc2FibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlzYWJsZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvblZpZGVvVHJhY2tFbmFibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RW5hYmxlZFZpZGVvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uQXVkaW9UcmFja0Rpc2FibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RGlzYWJsZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbkF1ZGlvVHJhY2tFbmFibGVkKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RW5hYmxlZEF1ZGlvVHJhY2snLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29uZmlndXJlX2F1ZGlvKGVuYWJsZTogYm9vbGVhbikge1xuXG4gICAgICAgIGlmIChlbmFibGUpIHtcblxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0F1ZGlvTW9kZSA9IHRoaXMuYXVkaW9NYW5hZ2VyLmdldE1vZGUoKTtcblxuICAgICAgICAgICAgLy8gUmVxdWVzdCBhdWRpbyBmb2N1cyBiZWZvcmUgbWFraW5nIGFueSBkZXZpY2Ugc3dpdGNoLlxuICAgICAgICAgICAgLy8gdGhpcy5hdWRpb01hbmFnZXIucmVxdWVzdEF1ZGlvRm9jdXMobnVsbCwgQXVkaW9NYW5hZ2VyLlNUUkVBTV9WT0lDRV9DQUxMLCBBdWRpb01hbmFnZXIuQVVESU9GT0NVU19HQUlOX1RSQU5TSUVOVCk7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RBdWRpb0ZvY3VzKCk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogVXNlIE1PREVfSU5fQ09NTVVOSUNBVElPTiBhcyB0aGUgZGVmYXVsdCBhdWRpbyBtb2RlLiBJdCBpcyByZXF1aXJlZFxuICAgICAgICAgICAgICogdG8gYmUgaW4gdGhpcyBtb2RlIHdoZW4gcGxheW91dCBhbmQvb3IgcmVjb3JkaW5nIHN0YXJ0cyBmb3IgdGhlIGJlc3RcbiAgICAgICAgICAgICAqIHBvc3NpYmxlIFZvSVAgcGVyZm9ybWFuY2UuIFNvbWUgZGV2aWNlcyBoYXZlIGRpZmZpY3VsdGllcyB3aXRoXG4gICAgICAgICAgICAgKiBzcGVha2VyIG1vZGUgaWYgdGhpcyBpcyBub3Qgc2V0LlxuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1vZGUoQXVkaW9NYW5hZ2VyLk1PREVfSU5fQ09NTVVOSUNBVElPTik7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBBbHdheXMgZGlzYWJsZSBtaWNyb3Bob25lIG11dGUgZHVyaW5nIGEgV2ViUlRDIGNhbGwuXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c01pY3JvcGhvbmVNdXRlID0gdGhpcy5hdWRpb01hbmFnZXIuaXNNaWNyb3Bob25lTXV0ZSgpO1xuICAgICAgICAgICAgdGhpcy5hdWRpb01hbmFnZXIuc2V0TWljcm9waG9uZU11dGUoZmFsc2UpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1vZGUodGhpcy5wcmV2aW91c0F1ZGlvTW9kZSk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5hYmFuZG9uQXVkaW9Gb2N1cyhudWxsKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9NYW5hZ2VyLnNldE1pY3JvcGhvbmVNdXRlKHRoaXMucHJldmlvdXNNaWNyb3Bob25lTXV0ZSk7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZXF1ZXN0QXVkaW9Gb2N1cygpIHtcbiAgICAgICAgaWYgKGFuZHJvaWQub3MuQnVpbGQuVkVSU0lPTi5TREtfSU5UID49IDI1KSB7XG5cbiAgICAgICAgICAgIHZhciBwbGF5YmFja0F0dHJpYnV0ZXMgPSBuZXcgQXVkaW9BdHRyaWJ1dGVzLkJ1aWxkZXIoKVxuICAgICAgICAgICAgICAgIC5zZXRVc2FnZShBdWRpb0F0dHJpYnV0ZXMuVVNBR0VfVk9JQ0VfQ09NTVVOSUNBVElPTilcbiAgICAgICAgICAgICAgICAuc2V0Q29udGVudFR5cGUoQXVkaW9BdHRyaWJ1dGVzLkNPTlRFTlRfVFlQRV9TUEVFQ0gpXG4gICAgICAgICAgICAgICAgLmJ1aWxkKCk7XG5cbiAgICAgICAgICAgIHZhciBmb2N1c1JlcXVlc3QgPSBuZXcgQXVkaW9Gb2N1c1JlcXVlc3QuQnVpbGRlcihBdWRpb01hbmFnZXIuQVVESU9GT0NVU19HQUlOX1RSQU5TSUVOVClcbiAgICAgICAgICAgICAgICAuc2V0QXVkaW9BdHRyaWJ1dGVzKHBsYXliYWNrQXR0cmlidXRlcylcbiAgICAgICAgICAgICAgICAuc2V0QWNjZXB0c0RlbGF5ZWRGb2N1c0dhaW4odHJ1ZSlcbiAgICAgICAgICAgICAgICAuc2V0T25BdWRpb0ZvY3VzQ2hhbmdlTGlzdGVuZXIobmV3IEF1ZGlvTWFuYWdlci5PbkF1ZGlvRm9jdXNDaGFuZ2VMaXN0ZW5lcih7XG4gICAgICAgICAgICAgICAgICAgIG9uQXVkaW9Gb2N1c0NoYW5nZShpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmJ1aWxkKCkpO1xuXG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5yZXF1ZXN0QXVkaW9Gb2N1cyhmb2N1c1JlcXVlc3QpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvTWFuYWdlci5yZXF1ZXN0QXVkaW9Gb2N1cyhudWxsLCBBdWRpb01hbmFnZXIuU1RSRUFNX1ZPSUNFX0NBTEwsIEF1ZGlvTWFuYWdlci5BVURJT0ZPQ1VTX0dBSU5fVFJBTlNJRU5UKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRfYWNjZXNzX3Rva2VuKHRva2VuOiBzdHJpbmcpIHtcblxuICAgICAgICB0aGlzLmFjY2Vzc1Rva2VuID0gdG9rZW47XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX3ZpZGVvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVmlkZW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlID0gIXRoaXMubG9jYWxWaWRlb1RyYWNrLmlzRW5hYmxlZCgpO1xuXG4gICAgICAgICAgICB0aGlzLmxvY2FsVmlkZW9UcmFjay5lbmFibGUoZW5hYmxlKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgdG9nZ2xlX2xvY2FsX2F1ZGlvKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsQXVkaW9UcmFjaykge1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlZCA9ICF0aGlzLmxvY2FsQXVkaW9UcmFjay5pc0VuYWJsZWQoKTtcblxuICAgICAgICAgICAgdGhpcy5sb2NhbEF1ZGlvVHJhY2suZW5hYmxlKGVuYWJsZWQpO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxufSJdfQ==
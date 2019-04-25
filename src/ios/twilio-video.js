"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("tns-core-modules/data/observable");
var delegates_1 = require("./delegates");
var VideoActivity = (function () {
    function VideoActivity() {
        this._roomDelegate = delegates_1.RoomDelegate.initWithOwner(new WeakRef(this), this);
        this._participantDelegate = delegates_1.RemoteParticipantDelegate.initWithOwner(new WeakRef(this), this);
    }
    VideoActivity.prototype.start_preview = function () {
        this.notify('start_preview');
        this.camera = TVICameraCapturer.alloc().initWithSource(TVICameraCaptureSourceFrontCamera);
        this.localVideoTrack = TVILocalVideoTrack.trackWithCapturer(this.camera);
        if (!this.localVideoTrack) {
            this.notify('Failed to add video track');
        }
        else {
            this.localVideoTrack.addRenderer(this.localVideoView);
        }
    };
    VideoActivity.prototype.disconnect = function () {
        if (this.room) {
            this.notify('disconnect');
            this.room.disconnect();
        }
    };
    VideoActivity.prototype.toggle_local_video = function () {
        if (this.localVideoTrack) {
            this.localVideoTrack.enabled = !this.localVideoTrack.enable;
        }
    };
    VideoActivity.prototype.toggle_local_audio = function () {
        if (this.localAudioTrack) {
            this.localAudioTrack.enabled = !this.localAudioTrack.enabled;
        }
    };
    VideoActivity.prototype.connect_to_room = function (room, options) {
        var _this = this;
        if (!this.accessToken) {
            this.notify('Please provide a valid token to connect to a room');
            return;
        }
        if (options.audio) {
            this.localAudioTrack = TVILocalAudioTrack.track();
        }
        if (options.video) {
            this.start_preview();
        }
        var connectOptions = TVIConnectOptions.optionsWithTokenBlock(this.accessToken, function (builder) {
            if (options.audio)
                builder.audioTracks = [_this.localAudioTrack];
            if (options.video)
                builder.videoTracks = [_this.localVideoTrack];
            builder.roomName = room;
        });
        this.room = TwilioVideo.connectWithOptionsDelegate(connectOptions, this._roomDelegate);
    };
    VideoActivity.prototype.cleanupRemoteParticipant = function () {
        if (this.remoteParticipant) {
            if (this.remoteParticipant.videoTracks.count > 0) {
                var videoTrack = this.remoteParticipant.remoteVideoTracks[0].remoteTrack;
                try {
                    videoTrack.removeRenderer(this.remoteVideoView);
                }
                catch (e) {
                    console.log(e);
                    this.notify(e);
                }
            }
        }
    };
    VideoActivity.prototype.notify = function (reason) {
        this.event.notify({
            eventName: 'error',
            object: observable_1.fromObject({
                reason: reason
            })
        });
    };
    VideoActivity.prototype.connectToRoomWithListener = function (room) {
        if (room.remoteParticipants.count > 0) {
            this.remoteParticipant = room.remoteParticipants[0];
            this.remoteParticipant.delegate = this._participantDelegate;
        }
    };
    VideoActivity.prototype.participant_joined_room = function (participant) {
        if (!this.remoteParticipant) {
            this.remoteParticipant = participant;
            this.remoteParticipant.delegate = this._participantDelegate;
        }
    };
    VideoActivity.prototype.set_access_token = function (token) {
        this.accessToken = token;
    };
    VideoActivity.prototype.remove_remote_view = function (videoTrack, participant) {
        if (this.remoteParticipant == participant) {
            console.log('remove_remote_view');
            videoTrack.removeRenderer(this.remoteVideoView);
        }
    };
    VideoActivity.prototype.add_video_track = function (videoTrack) {
        videoTrack.addRenderer(this.remoteVideoView);
    };
    VideoActivity.prototype.destroy_local_video = function () {
        this.localVideoTrack.removeRenderer(this.localVideoView);
    };
    VideoActivity.prototype.configure_audio = function (enable) {
        if (!this.localAudioTrack) {
            this.localAudioTrack = TVILocalAudioTrack.track();
            if (!this.localAudioTrack) {
                return 'failed to get local audio';
            }
        }
    };
    Object.defineProperty(VideoActivity.prototype, "event", {
        get: function () {
            return delegates_1.DelegateEvents._event;
        },
        enumerable: true,
        configurable: true
    });
    return VideoActivity;
}());
exports.VideoActivity = VideoActivity;
//# sourceMappingURL=twilio-video.js.map
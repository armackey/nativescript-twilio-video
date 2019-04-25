"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("tns-core-modules/data/observable");
var DelegateEvents = (function () {
    function DelegateEvents() {
    }
    DelegateEvents._event = new observable_1.Observable();
    return DelegateEvents;
}());
exports.DelegateEvents = DelegateEvents;
var RoomDelegate = (function (_super) {
    __extends(RoomDelegate, _super);
    function RoomDelegate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RoomDelegate.initWithOwner = function (owner, ctx) {
        var roomDelegate = new RoomDelegate();
        roomDelegate._event = DelegateEvents._event;
        roomDelegate._owner = owner;
        roomDelegate.context = ctx;
        return roomDelegate;
    };
    RoomDelegate.prototype.didConnectToRoom = function (room) {
        this.context.connectToRoomWithListener(room);
        this._event.notify({
            eventName: 'didConnectToRoom',
            object: observable_1.fromObject({
                room: room,
                count: room.remoteParticipants.count
            })
        });
        console.log('didConnectToRoom');
    };
    RoomDelegate.prototype.roomParticipantDidConnect = function (room, participant) {
        console.log('roomParticipantDidConnect');
        this.context.participant_joined_room(participant);
        this._event.notify({
            eventName: 'participantDidConnect',
            object: observable_1.fromObject({
                room: room,
                participant: participant,
                count: room.remoteParticipants.count
            })
        });
        console.log('participantDidConnect');
    };
    RoomDelegate.prototype.roomParticipantDidDisconnect = function (room, participant) {
        if (this.context.remoteParticipants === participant) {
            console.log('roomParticipantDidDisconnect');
            this.context.cleanupRemoteParticipant();
        }
        this._event.notify({
            eventName: 'participantDidDisconnect',
            object: observable_1.fromObject({
                room: room,
                participant: participant
            })
        });
        console.log('participantDidDisconnect');
    };
    RoomDelegate.prototype.roomDidFailToConnectWithError = function (room, error) {
        this._event.notify({
            eventName: 'didFailToConnectWithError',
            object: observable_1.fromObject({
                room: room,
                error: error
            })
        });
        console.log('didFailToConnectWithError');
    };
    ;
    RoomDelegate.prototype.roomDidDisconnectWithError = function (room, error) {
        this.context.cleanupRemoteParticipant();
        this._event.notify({
            eventName: 'disconnectedWithError',
            object: observable_1.fromObject({
                room: room,
                error: error
            })
        });
        console.log('disconnectedWithError');
    };
    ;
    RoomDelegate.prototype.roomDidStartRecording = function (room) {
        console.log('roomDidStartRecording');
    };
    RoomDelegate.prototype.roomDidStopRecording = function (room) {
        console.log('roomDidStopRecording');
    };
    Object.defineProperty(RoomDelegate.prototype, "events", {
        get: function () {
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    RoomDelegate.ObjCProtocols = [TVIRoomDelegate];
    return RoomDelegate;
}(NSObject));
exports.RoomDelegate = RoomDelegate;
var RemoteParticipantDelegate = (function (_super) {
    __extends(RemoteParticipantDelegate, _super);
    function RemoteParticipantDelegate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RemoteParticipantDelegate.initWithOwner = function (owner, ctx) {
        var remoteParticipantDelegate = new RemoteParticipantDelegate();
        remoteParticipantDelegate._event = DelegateEvents._event;
        remoteParticipantDelegate._owner = owner;
        remoteParticipantDelegate.context = ctx;
        return remoteParticipantDelegate;
    };
    RemoteParticipantDelegate.prototype.remoteParticipantPublishedVideoTrack = function (participant, publication) {
        this._event.notify({
            eventName: 'participantPublishedVideoTrack',
            object: observable_1.fromObject({
                participant: participant,
                publication: publication,
            })
        });
    };
    RemoteParticipantDelegate.prototype.remoteParticipantUnpublishedVideoTrack = function (participant, publication) {
        this._event.notify({
            eventName: 'participantUnpublishedVideoTrack',
            object: observable_1.fromObject({
                participant: participant,
                publication: publication,
            })
        });
    };
    RemoteParticipantDelegate.prototype.remoteParticipantPublishedAudioTrack = function (participant, publication) {
        this._event.notify({
            eventName: 'participantPublishedAudioTrack',
            object: observable_1.fromObject({
                participant: participant,
                publication: publication,
            })
        });
    };
    RemoteParticipantDelegate.prototype.remoteParticipantUnpublishedAudioTrack = function (participant, publication) {
        this._event.notify({
            eventName: 'participantUnpublishedAudioTrack',
            object: observable_1.fromObject({
                participant: participant,
                publication: publication,
            })
        });
    };
    RemoteParticipantDelegate.prototype.subscribedToVideoTrackPublicationForParticipant = function (videoTrack, publication, participant) {
        videoTrack.addRenderer(this.context.remoteVideoView);
        this.context.videoTrack = videoTrack;
        this._event.notify({
            eventName: 'onVideoTrackSubscribed',
            object: observable_1.fromObject({
                videoTrack: videoTrack,
                publication: publication,
                participant: participant
            })
        });
    };
    RemoteParticipantDelegate.prototype.unsubscribedFromVideoTrackPublicationForParticipant = function (videoTrack, publication, participant) {
        videoTrack.removeRenderer(this.context.remoteVideoView);
        this.context.remoteVideoView.removeFromSuperview();
        this._event.notify({
            eventName: 'onVideoTrackUnsubscribed',
            object: observable_1.fromObject({
                videoTrack: videoTrack,
                publication: publication,
                participant: participant
            })
        });
    };
    RemoteParticipantDelegate.prototype.subscribedToAudioTrackPublicationForParticipant = function (audioTrack, publication, participant) {
        this._event.notify({
            eventName: 'onAudioTrackSubscribed',
            object: observable_1.fromObject({
                audioTrack: audioTrack,
                publication: publication,
                participant: participant
            })
        });
    };
    RemoteParticipantDelegate.prototype.unsubscribedFromAudioTrackPublicationForParticipant = function (videoTrack, publication, participant) {
        this._event.notify({
            eventName: 'onAudioTrackUnsubscribed',
            object: observable_1.fromObject({
                videoTrack: videoTrack,
                publication: publication,
                participant: participant
            })
        });
    };
    RemoteParticipantDelegate.prototype.remoteParticipantEnabledVideoTrack = function (participant, publication) {
        this._event.notify({
            eventName: 'participantEnabledVideoTrack',
            object: observable_1.fromObject({
                publication: publication,
                participant: participant
            })
        });
    };
    RemoteParticipantDelegate.prototype.remoteParticipantDisabledVideoTrack = function (participant, publication) {
        this._event.notify({
            eventName: 'participantDisabledVideoTrack',
            object: observable_1.fromObject({
                publication: publication,
                participant: participant
            })
        });
    };
    RemoteParticipantDelegate.prototype.remoteParticipantEnabledAudioTrack = function (participant, publication) {
        this._event.notify({
            eventName: 'participantEnabledAudioTrack',
            object: observable_1.fromObject({
                publication: publication,
                participant: participant
            })
        });
    };
    RemoteParticipantDelegate.prototype.remoteParticipantDisabledAudioTrack = function (participant, publication) {
        this._event.notify({
            eventName: 'participantDisabledAudioTrack',
            object: observable_1.fromObject({
                publication: publication,
                participant: participant
            })
        });
    };
    Object.defineProperty(RemoteParticipantDelegate.prototype, "events", {
        get: function () {
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    RemoteParticipantDelegate.ObjCProtocols = [TVIRemoteParticipantDelegate];
    return RemoteParticipantDelegate;
}(NSObject));
exports.RemoteParticipantDelegate = RemoteParticipantDelegate;
var VideoViewDelegate = (function (_super) {
    __extends(VideoViewDelegate, _super);
    function VideoViewDelegate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VideoViewDelegate.initWithOwner = function (owner) {
        var videoViewDelegate = new VideoViewDelegate();
        videoViewDelegate._event = DelegateEvents._event;
        videoViewDelegate._owner = owner;
        return videoViewDelegate;
    };
    VideoViewDelegate.prototype.videoViewDidReceiveData = function (view) {
        console.log('videoViewDidReceiveData');
        this._event.notify({
            eventName: 'videoViewDidReceiveData',
            object: observable_1.fromObject({
                view: view,
            })
        });
    };
    Object.defineProperty(VideoViewDelegate.prototype, "events", {
        get: function () {
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    VideoViewDelegate.ObjCProtocols = [TVIVideoViewDelegate];
    return VideoViewDelegate;
}(NSObject));
exports.VideoViewDelegate = VideoViewDelegate;
var CameraCapturerDelegate = (function (_super) {
    __extends(CameraCapturerDelegate, _super);
    function CameraCapturerDelegate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CameraCapturerDelegate.initWithOwner = function (owner) {
        var cameraCapturerDelegate = new CameraCapturerDelegate();
        cameraCapturerDelegate._event = DelegateEvents._event;
        cameraCapturerDelegate._owner = owner;
        return cameraCapturerDelegate;
    };
    CameraCapturerDelegate.prototype.cameraCapturerDidStartWithSource = function (capturer, source) {
        console.log('cameraCapturer didStartWithSource');
        this._event.notify({
            eventName: 'cameraCapturer',
            object: observable_1.fromObject({
                capturer: capturer,
                source: source
            })
        });
    };
    CameraCapturerDelegate.prototype.cameraCapturerWasInterrupted = function (capturer, reason) {
        console.log('cameraCapturerWasInterrupted');
        this._event.notify({
            eventName: 'cameraCapturerWasInterrupted',
            object: observable_1.fromObject({
                capturer: capturer,
                reason: reason,
            })
        });
    };
    CameraCapturerDelegate.prototype.cameraCapturerDidFailWithError = function (capturer, error) {
        console.log('cameraCapturerDidFailWithError');
        this._event.notify({
            eventName: 'cameraCapturerDidFailWithError',
            object: observable_1.fromObject({
                capturer: capturer,
                error: error,
            })
        });
    };
    Object.defineProperty(CameraCapturerDelegate.prototype, "events", {
        get: function () {
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    CameraCapturerDelegate.ObjCProtocols = [TVICameraCapturerDelegate];
    return CameraCapturerDelegate;
}(NSObject));
exports.CameraCapturerDelegate = CameraCapturerDelegate;
//# sourceMappingURL=delegates.js.map
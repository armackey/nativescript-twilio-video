"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("tns-core-modules/data/observable");
var DelegateEvents = (function () {
    function DelegateEvents() {
    }
    return DelegateEvents;
}());
DelegateEvents._event = new observable_1.Observable();
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
    return RoomDelegate;
}(NSObject));
RoomDelegate.ObjCProtocols = [TVIRoomDelegate];
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
    return RemoteParticipantDelegate;
}(NSObject));
RemoteParticipantDelegate.ObjCProtocols = [TVIRemoteParticipantDelegate];
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
    return VideoViewDelegate;
}(NSObject));
VideoViewDelegate.ObjCProtocols = [TVIVideoViewDelegate];
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
    return CameraCapturerDelegate;
}(NSObject));
CameraCapturerDelegate.ObjCProtocols = [TVICameraCapturerDelegate];
exports.CameraCapturerDelegate = CameraCapturerDelegate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZWdhdGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVsZWdhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0RBQTBFO0FBTTFFO0lBQUE7SUFJQSxDQUFDO0lBQUQscUJBQUM7QUFBRCxDQUFDLEFBSkQ7QUFFVyxxQkFBTSxHQUFlLElBQUksdUJBQVUsRUFBRSxDQUFDO0FBRnBDLHdDQUFjO0FBTTNCO0lBQWtDLGdDQUFRO0lBQTFDOztJQStIQSxDQUFDO0lBbkhpQiwwQkFBYSxHQUEzQixVQUE0QixLQUFtQixFQUFFLEdBQUc7UUFFaEQsSUFBSSxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUV0QyxZQUFZLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUE7UUFFM0MsWUFBWSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFNUIsWUFBWSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7UUFFM0IsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUV4QixDQUFDO0lBRU0sdUNBQWdCLEdBQXZCLFVBQXdCLElBQUk7UUFFeEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNmLFNBQVMsRUFBRSxrQkFBa0I7WUFDN0IsTUFBTSxFQUFFLHVCQUFVLENBQUM7Z0JBQ2YsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLO2FBQ3ZDLENBQUM7U0FDTCxDQUFDLENBQUE7UUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLGdEQUF5QixHQUFoQyxVQUFpQyxJQUFJLEVBQUUsV0FBVztRQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFLekMsSUFBSSxDQUFDLE9BQU8sQ0FB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LE1BQU0sRUFBRSx1QkFBVSxDQUFDO2dCQUNmLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixLQUFLLEVBQUUsS0FBSzthQUNmLENBQUM7U0FDTCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsc0JBQUksMENBQU07YUFBVjtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRXZCLENBQUM7OztPQUFBO0lBRUwsNkJBQUM7QUFBRCxDQUFDLEFBdkVELENBQTRDLFFBQVE7QUFFbEMsb0NBQWEsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFGakQsd0RBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbU9iamVjdCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZGF0YS9vYnNlcnZhYmxlJztcblxuZGVjbGFyZSB2YXIgVFZJVmlkZW9WaWV3RGVsZWdhdGUsIFRWSUNhbWVyYUNhcHR1cmVyRGVsZWdhdGUsIFRWSVJlbW90ZVBhcnRpY2lwYW50RGVsZWdhdGUsIFRWSVJvb21EZWxlZ2F0ZTtcbi8vIFRWSVJlbW90ZVBhcnRpY2lwYW50RGVsZWdhdGVcbi8vIFRWSVBhcnRpY2lwYW50RGVsZWdhdGVcblxuZXhwb3J0IGNsYXNzIERlbGVnYXRlRXZlbnRzIHtcblxuICAgIHN0YXRpYyBfZXZlbnQ6IE9ic2VydmFibGUgPSBuZXcgT2JzZXJ2YWJsZSgpO1xuXG59XG5cbmV4cG9ydCBjbGFzcyBSb29tRGVsZWdhdGUgZXh0ZW5kcyBOU09iamVjdCB7XG5cbiAgICBzdGF0aWMgT2JqQ1Byb3RvY29scyA9IFtUVklSb29tRGVsZWdhdGVdOyAvLyBkZWZpbmUgb3VyIG5hdGl2ZSBwcm90b2NhbGxzXG5cbiAgICBwcml2YXRlIF9ldmVudDogT2JzZXJ2YWJsZTtcblxuICAgIHByaXZhdGUgX293bmVyOiBXZWFrUmVmPGFueT47XG5cbiAgICBwdWJsaWMgX3BhcnRpY2lwYW50RGVsZWdhdGU6IFJvb21EZWxlZ2F0ZTtcblxuICAgIGNvbnRleHQ6IGFueTtcblxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdFdpdGhPd25lcihvd25lcjogV2Vha1JlZjxhbnk+LCBjdHgpOiBSb29tRGVsZWdhdGUge1xuXG4gICAgICAgIGxldCByb29tRGVsZWdhdGUgPSBuZXcgUm9vbURlbGVnYXRlKCk7XG5cbiAgICAgICAgcm9vbURlbGVnYXRlLl9ldmVudCA9IERlbGVnYXRlRXZlbnRzLl9ldmVudFxuXG4gICAgICAgIHJvb21EZWxlZ2F0ZS5fb3duZXIgPSBvd25lcjtcblxuICAgICAgICByb29tRGVsZWdhdGUuY29udGV4dCA9IGN0eDtcblxuICAgICAgICByZXR1cm4gcm9vbURlbGVnYXRlO1xuXG4gICAgfVxuXG4gICAgcHVibGljIGRpZENvbm5lY3RUb1Jvb20ocm9vbSk6IHZvaWQge1xuXG4gICAgICAgIHRoaXMuY29udGV4dC5jb25uZWN0VG9Sb29tV2l0aExpc3RlbmVyKHJvb20pO1xuXG4gICAgICAgIHRoaXMuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICBldmVudE5hbWU6ICdkaWRDb25uZWN0VG9Sb29tJyxcbiAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICBjb3VudDogcm9vbS5yZW1vdGVQYXJ0aWNpcGFudHMuY291bnRcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnNvbGUubG9nKCdkaWRDb25uZWN0VG9Sb29tJyk7XG4gICAgfVxuXG4gICAgcHVibGljIHJvb21QYXJ0aWNpcGFudERpZENvbm5lY3Qocm9vbSwgcGFydGljaXBhbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3Jvb21QYXJ0aWNpcGFudERpZENvbm5lY3QnKTtcbiAgICAgICAgLy8gaWYgKCF0aGlzLmNvbnRleHQucmVtb3RlUGFydGljaXBhbnQgfHwgdGhpcy5jb250ZXh0LnJlbW90ZVBhcnRpY2lwYW50ID09PSBudWxsKSB7XG4gICAgICAgIC8vICAgICB0aGlzLmNvbnRleHQucmVtb3RlUGFydGljaXBhbnQgPSBwYXJ0aWNpcGFudDtcbiAgICAgICAgLy8gICAgIHRoaXMuY29udGV4dC5yZW1vdGVQYXJ0aWNpcGFudC5kZWxlZ2F0ZSA9IHRoaXM7XG4gICAgICAgIC8vIH1cbiAgICAgICAgdGhpcy5jb250ZXh0LnBhcnRpY2lwYW50X2pvaW5lZF9yb29tKHBhcnRpY2lwYW50KTtcblxuICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnREaWRDb25uZWN0JyxcbiAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgY291bnQ6IHJvb20ucmVtb3RlUGFydGljaXBhbnRzLmNvdW50XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdwYXJ0aWNpcGFudERpZENvbm5lY3QnKTtcblxuICAgIH1cbiAgICBwdWJsaWMgcm9vbVBhcnRpY2lwYW50RGlkRGlzY29ubmVjdChyb29tLCBwYXJ0aWNpcGFudCk6IHZvaWQge1xuXG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQucmVtb3RlUGFydGljaXBhbnRzID09PSBwYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3Jvb21QYXJ0aWNpcGFudERpZERpc2Nvbm5lY3QnKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5jbGVhbnVwUmVtb3RlUGFydGljaXBhbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudERpZERpc2Nvbm5lY3QnLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgICAgY29uc29sZS5sb2coJ3BhcnRpY2lwYW50RGlkRGlzY29ubmVjdCcpO1xuICAgIH1cblxuXG5cbiAgICBwdWJsaWMgcm9vbURpZEZhaWxUb0Nvbm5lY3RXaXRoRXJyb3Iocm9vbSwgZXJyb3IpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgIGV2ZW50TmFtZTogJ2RpZEZhaWxUb0Nvbm5lY3RXaXRoRXJyb3InLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgICAgY29uc29sZS5sb2coJ2RpZEZhaWxUb0Nvbm5lY3RXaXRoRXJyb3InKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJvb21EaWREaXNjb25uZWN0V2l0aEVycm9yKHJvb20sIGVycm9yKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY29udGV4dC5jbGVhbnVwUmVtb3RlUGFydGljaXBhbnQoKTtcbiAgICAgICAgdGhpcy5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgIGV2ZW50TmFtZTogJ2Rpc2Nvbm5lY3RlZFdpdGhFcnJvcicsXG4gICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICBjb25zb2xlLmxvZygnZGlzY29ubmVjdGVkV2l0aEVycm9yJylcbiAgICB9O1xuXG4gICAgcm9vbURpZFN0YXJ0UmVjb3JkaW5nKHJvb20pOiB2b2lkIHtcbiAgICAgICAgLy8gICAgIHRoaXMuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgIC8vICAgICAgICAgZXZlbnROYW1lOiAncm9vbURpZFN0YXJ0UmVjb3JkaW5nJyxcbiAgICAgICAgLy8gICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAvLyAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAvLyAgICAgICAgIH0pXG4gICAgICAgIC8vICAgICB9KVxuICAgICAgICBjb25zb2xlLmxvZygncm9vbURpZFN0YXJ0UmVjb3JkaW5nJylcbiAgICB9XG4gICAgcm9vbURpZFN0b3BSZWNvcmRpbmcocm9vbSk6IHZvaWQge1xuICAgICAgICAvLyAgICAgdGhpcy5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgLy8gICAgICAgICBldmVudE5hbWU6ICdyb29tRGlkU3RvcFJlY29yZGluZycsXG4gICAgICAgIC8vICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgLy8gICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgLy8gICAgICAgICB9KVxuICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgY29uc29sZS5sb2coJ3Jvb21EaWRTdG9wUmVjb3JkaW5nJylcbiAgICB9XG5cbiAgICBnZXQgZXZlbnRzKCk6IE9ic2VydmFibGUge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudDtcblxuICAgIH1cblxufVxuXG5cbmV4cG9ydCBjbGFzcyBSZW1vdGVQYXJ0aWNpcGFudERlbGVnYXRlIGV4dGVuZHMgTlNPYmplY3Qge1xuXG4gICAgc3RhdGljIE9iakNQcm90b2NvbHMgPSBbVFZJUmVtb3RlUGFydGljaXBhbnREZWxlZ2F0ZV07IC8vIGRlZmluZSBvdXIgbmF0aXZlIHByb3RvY2FsbHNcblxuICAgIHByaXZhdGUgX2V2ZW50OiBPYnNlcnZhYmxlO1xuICAgIHByaXZhdGUgX293bmVyOiBXZWFrUmVmPGFueT47XG4gICAgY29udGV4dDogYW55O1xuXG4gICAgcHVibGljIHN0YXRpYyBpbml0V2l0aE93bmVyKG93bmVyOiBXZWFrUmVmPGFueT4sIGN0eCk6IFJlbW90ZVBhcnRpY2lwYW50RGVsZWdhdGUge1xuXG4gICAgICAgIGxldCByZW1vdGVQYXJ0aWNpcGFudERlbGVnYXRlID0gbmV3IFJlbW90ZVBhcnRpY2lwYW50RGVsZWdhdGUoKTtcblxuICAgICAgICByZW1vdGVQYXJ0aWNpcGFudERlbGVnYXRlLl9ldmVudCA9IERlbGVnYXRlRXZlbnRzLl9ldmVudFxuXG4gICAgICAgIHJlbW90ZVBhcnRpY2lwYW50RGVsZWdhdGUuX293bmVyID0gb3duZXI7XG5cbiAgICAgICAgcmVtb3RlUGFydGljaXBhbnREZWxlZ2F0ZS5jb250ZXh0ID0gY3R4O1xuXG4gICAgICAgIHJldHVybiByZW1vdGVQYXJ0aWNpcGFudERlbGVnYXRlO1xuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVtb3RlUGFydGljaXBhbnRQdWJsaXNoZWRWaWRlb1RyYWNrKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbik6IHZvaWQge1xuICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRQdWJsaXNoZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvbixcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcHVibGljIHJlbW90ZVBhcnRpY2lwYW50VW5wdWJsaXNoZWRWaWRlb1RyYWNrKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbik6IHZvaWQge1xuICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRVbnB1Ymxpc2hlZFZpZGVvVHJhY2snLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3RlUGFydGljaXBhbnRQdWJsaXNoZWRBdWRpb1RyYWNrKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbik6IHZvaWQge1xuICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRQdWJsaXNoZWRBdWRpb1RyYWNrJyxcbiAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvbixcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcHVibGljIHJlbW90ZVBhcnRpY2lwYW50VW5wdWJsaXNoZWRBdWRpb1RyYWNrKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbik6IHZvaWQge1xuICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnRVbnB1Ymxpc2hlZEF1ZGlvVHJhY2snLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBwdWJsaWMgc3Vic2NyaWJlZFRvVmlkZW9UcmFja1B1YmxpY2F0aW9uRm9yUGFydGljaXBhbnQodmlkZW9UcmFjaywgcHVibGljYXRpb24sIHBhcnRpY2lwYW50KTogdm9pZCB7XG4gICAgICAgIC8vIGNvbnNvbGUuZGlyKHRoaXMuY29udGV4dC5yZW1vdGVWaWRlb1ZpZXcpXG4gICAgICAgIHZpZGVvVHJhY2suYWRkUmVuZGVyZXIodGhpcy5jb250ZXh0LnJlbW90ZVZpZGVvVmlldyk7XG4gICAgICAgIHRoaXMuY29udGV4dC52aWRlb1RyYWNrID0gdmlkZW9UcmFjaztcblxuICAgICAgICAvLyB0aGlzLmNvbnRleHQuc2V0dXBSZW1vdGVWaWV3KHZpZGVvVHJhY2ssIHBhcnRpY2lwYW50KTtcbiAgICAgICAgdGhpcy5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uVmlkZW9UcmFja1N1YnNjcmliZWQnLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICB2aWRlb1RyYWNrOiB2aWRlb1RyYWNrLFxuICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvbixcbiAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIC8vIGlmIChzZWxmLnJlbW90ZVBhcnRpY2lwYW50ID09IHBhcnRpY2lwYW50KSB7XG4gICAgICAgIC8vICAgICBbc2VsZiBzZXR1cFJlbW90ZVZpZXddO1xuICAgICAgICAvLyAgICAgW3ZpZGVvVHJhY2sgYWRkUmVuZGVyZXI6c2VsZi5yZW1vdGVWaWV3XTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIHB1YmxpYyB1bnN1YnNjcmliZWRGcm9tVmlkZW9UcmFja1B1YmxpY2F0aW9uRm9yUGFydGljaXBhbnQodmlkZW9UcmFjaywgcHVibGljYXRpb24sIHBhcnRpY2lwYW50KTogdm9pZCB7XG5cbiAgICAgICAgdmlkZW9UcmFjay5yZW1vdmVSZW5kZXJlcih0aGlzLmNvbnRleHQucmVtb3RlVmlkZW9WaWV3KTtcbiAgICAgICAgdGhpcy5jb250ZXh0LnJlbW90ZVZpZGVvVmlldy5yZW1vdmVGcm9tU3VwZXJ2aWV3KCk7XG5cbiAgICAgICAgdGhpcy5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uVmlkZW9UcmFja1Vuc3Vic2NyaWJlZCcsXG4gICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIHZpZGVvVHJhY2s6IHZpZGVvVHJhY2ssXG4gICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBpZiAoc2VsZi5yZW1vdGVQYXJ0aWNpcGFudCA9PSBwYXJ0aWNpcGFudCkge1xuICAgICAgICAvLyAgICAgW3ZpZGVvVHJhY2sgcmVtb3ZlUmVuZGVyZXI6c2VsZi5yZW1vdGVWaWV3XTtcbiAgICAgICAgLy8gICAgIFtzZWxmLnJlbW90ZVZpZXcgcmVtb3ZlRnJvbVN1cGVydmlld107XG4gICAgICAgIC8vIH1cblxuICAgIH1cblxuICAgIHB1YmxpYyBzdWJzY3JpYmVkVG9BdWRpb1RyYWNrUHVibGljYXRpb25Gb3JQYXJ0aWNpcGFudChhdWRpb1RyYWNrLCBwdWJsaWNhdGlvbiwgcGFydGljaXBhbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQXVkaW9UcmFja1N1YnNjcmliZWQnLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICBhdWRpb1RyYWNrOiBhdWRpb1RyYWNrLFxuICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvbixcbiAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcHVibGljIHVuc3Vic2NyaWJlZEZyb21BdWRpb1RyYWNrUHVibGljYXRpb25Gb3JQYXJ0aWNpcGFudCh2aWRlb1RyYWNrLCBwdWJsaWNhdGlvbiwgcGFydGljaXBhbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQXVkaW9UcmFja1Vuc3Vic2NyaWJlZCcsXG4gICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIHZpZGVvVHJhY2s6IHZpZGVvVHJhY2ssXG4gICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW90ZVBhcnRpY2lwYW50RW5hYmxlZFZpZGVvVHJhY2socGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudEVuYWJsZWRWaWRlb1RyYWNrJyxcbiAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uLFxuICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW90ZVBhcnRpY2lwYW50RGlzYWJsZWRWaWRlb1RyYWNrKHBhcnRpY2lwYW50LCBwdWJsaWNhdGlvbik6IHZvaWQge1xuICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgICAgICAgICAgZXZlbnROYW1lOiAncGFydGljaXBhbnREaXNhYmxlZFZpZGVvVHJhY2snLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3RlUGFydGljaXBhbnRFbmFibGVkQXVkaW9UcmFjayhwYXJ0aWNpcGFudCwgcHVibGljYXRpb24pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgIGV2ZW50TmFtZTogJ3BhcnRpY2lwYW50RW5hYmxlZEF1ZGlvVHJhY2snLFxuICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICBwdWJsaWNhdGlvbjogcHVibGljYXRpb24sXG4gICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3RlUGFydGljaXBhbnREaXNhYmxlZEF1ZGlvVHJhY2socGFydGljaXBhbnQsIHB1YmxpY2F0aW9uKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICBldmVudE5hbWU6ICdwYXJ0aWNpcGFudERpc2FibGVkQXVkaW9UcmFjaycsXG4gICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIHB1YmxpY2F0aW9uOiBwdWJsaWNhdGlvbixcbiAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBldmVudHMoKTogT2JzZXJ2YWJsZSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50O1xuXG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBWaWRlb1ZpZXdEZWxlZ2F0ZSBleHRlbmRzIE5TT2JqZWN0IHtcblxuICAgIHB1YmxpYyBzdGF0aWMgT2JqQ1Byb3RvY29scyA9IFtUVklWaWRlb1ZpZXdEZWxlZ2F0ZV07XG5cbiAgICBwcml2YXRlIF9ldmVudDogT2JzZXJ2YWJsZTtcblxuICAgIHByaXZhdGUgX293bmVyOiBXZWFrUmVmPGFueT47XG5cbiAgICBwdWJsaWMgc3RhdGljIGluaXRXaXRoT3duZXIob3duZXI6IFdlYWtSZWY8YW55Pik6IFZpZGVvVmlld0RlbGVnYXRlIHtcblxuICAgICAgICBsZXQgdmlkZW9WaWV3RGVsZWdhdGUgPSBuZXcgVmlkZW9WaWV3RGVsZWdhdGUoKTtcblxuICAgICAgICB2aWRlb1ZpZXdEZWxlZ2F0ZS5fZXZlbnQgPSBEZWxlZ2F0ZUV2ZW50cy5fZXZlbnRcblxuICAgICAgICB2aWRlb1ZpZXdEZWxlZ2F0ZS5fb3duZXIgPSBvd25lcjtcblxuICAgICAgICByZXR1cm4gdmlkZW9WaWV3RGVsZWdhdGU7XG5cbiAgICB9XG5cblxuICAgIHB1YmxpYyB2aWRlb1ZpZXdEaWRSZWNlaXZlRGF0YSh2aWV3OiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3ZpZGVvVmlld0RpZFJlY2VpdmVEYXRhJyk7XG4gICAgICAgIHRoaXMuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICBldmVudE5hbWU6ICd2aWRlb1ZpZXdEaWRSZWNlaXZlRGF0YScsXG4gICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIHZpZXc6IHZpZXcsXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBwdWJsaWMgdmlkZW9WaWV3VmlkZW9EaW1lbnNpb25zRGlkQ2hhbmdlKHZpZXc6IGFueSwgZGltZW5zaW9uczogYW55KSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCd2aWRlb0RpbWVuc2lvbnNEaWRDaGFuZ2UnKTtcbiAgICAvLyAgICAgICAgIHRoaXMuX2V2ZW50Lm5vdGlmeSh7XG4gICAgLy8gICAgICAgICAgICAgZXZlbnROYW1lOiAndmlkZW9EaW1lbnNpb25zRGlkQ2hhbmdlJyxcbiAgICAvLyAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgIC8vICAgICAgICAgICAgICAgICB2aWV3OiB2aWV3LFxuICAgIC8vICAgICAgICAgICAgICAgICBkaW1lbnNpb25zOiBkaW1lbnNpb25zXG4gICAgLy8gICAgICAgICAgICAgfSlcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuXG4gICAgLy8gcHVibGljIHZpZGVvVmlld1ZpZGVvT3JpZW50YXRpb25EaWRDaGFuZ2UodmlldzogYW55LCBvcmllbnRhdGlvbjogYW55KSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCd2aWRlb1ZpZXdWaWRlb09yaWVudGF0aW9uRGlkQ2hhbmdlJyk7XG4gICAgLy8gICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgIC8vICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3ZpZGVvVmlld1ZpZGVvT3JpZW50YXRpb25EaWRDaGFuZ2UnLFxuICAgIC8vICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgLy8gICAgICAgICAgICAgICAgIHZpZXc6IHZpZXcsXG4gICAgLy8gICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiBvcmllbnRhdGlvblxuICAgIC8vICAgICAgICAgICAgIH0pXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cblxuICAgIGdldCBldmVudHMoKTogT2JzZXJ2YWJsZSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50O1xuXG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBDYW1lcmFDYXB0dXJlckRlbGVnYXRlIGV4dGVuZHMgTlNPYmplY3Qge1xuXG4gICAgcHVibGljIHN0YXRpYyBPYmpDUHJvdG9jb2xzID0gW1RWSUNhbWVyYUNhcHR1cmVyRGVsZWdhdGVdOyAvLyBkZWZpbmUgb3VyIG5hdGl2ZSBwcm90b2NhbGxzXG5cbiAgICBwcml2YXRlIF9ldmVudDogT2JzZXJ2YWJsZTtcblxuICAgIHByaXZhdGUgX293bmVyOiBXZWFrUmVmPGFueT47XG5cbiAgICBwdWJsaWMgc3RhdGljIGluaXRXaXRoT3duZXIob3duZXI6IFdlYWtSZWY8YW55Pik6IENhbWVyYUNhcHR1cmVyRGVsZWdhdGUge1xuXG4gICAgICAgIGxldCBjYW1lcmFDYXB0dXJlckRlbGVnYXRlID0gbmV3IENhbWVyYUNhcHR1cmVyRGVsZWdhdGUoKTtcblxuICAgICAgICBjYW1lcmFDYXB0dXJlckRlbGVnYXRlLl9ldmVudCA9IERlbGVnYXRlRXZlbnRzLl9ldmVudFxuXG4gICAgICAgIGNhbWVyYUNhcHR1cmVyRGVsZWdhdGUuX293bmVyID0gb3duZXI7XG5cbiAgICAgICAgcmV0dXJuIGNhbWVyYUNhcHR1cmVyRGVsZWdhdGU7XG5cbiAgICB9XG5cbiAgICAvLyBwdWJsaWMgY2FtZXJhQ2FwdHVyZXJQcmV2aWV3RGlkU3RhcnQoY2FwdHVyZXI6IGFueSkge1xuXG4gICAgLy8gICAgICAgICB0aGlzLl9ldmVudC5ub3RpZnkoe1xuICAgIC8vICAgICAgICAgICAgIGV2ZW50TmFtZTogJ2NhbWVyYUNhcHR1cmVyUHJldmlld0RpZFN0YXJ0JyxcbiAgICAvLyAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgIC8vICAgICAgICAgICAgICAgICBjYXB0dXJlcjogY2FwdHVyZXIsXG4gICAgLy8gICAgICAgICAgICAgfSlcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuXG4gICAgcHVibGljIGNhbWVyYUNhcHR1cmVyRGlkU3RhcnRXaXRoU291cmNlKGNhcHR1cmVyOiBhbnksIHNvdXJjZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjYW1lcmFDYXB0dXJlciBkaWRTdGFydFdpdGhTb3VyY2UnKTtcbiAgICAgICAgdGhpcy5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgIGV2ZW50TmFtZTogJ2NhbWVyYUNhcHR1cmVyJyxcbiAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgY2FwdHVyZXI6IGNhcHR1cmVyLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogc291cmNlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBjYW1lcmFDYXB0dXJlcldhc0ludGVycnVwdGVkKGNhcHR1cmVyOiBhbnksIHJlYXNvbjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjYW1lcmFDYXB0dXJlcldhc0ludGVycnVwdGVkJyk7XG4gICAgICAgIHRoaXMuX2V2ZW50Lm5vdGlmeSh7XG4gICAgICAgICAgICBldmVudE5hbWU6ICdjYW1lcmFDYXB0dXJlcldhc0ludGVycnVwdGVkJyxcbiAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgY2FwdHVyZXI6IGNhcHR1cmVyLFxuICAgICAgICAgICAgICAgIHJlYXNvbjogcmVhc29uLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNhbWVyYUNhcHR1cmVyRGlkRmFpbFdpdGhFcnJvcihjYXB0dXJlcjogYW55LCBlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjYW1lcmFDYXB0dXJlckRpZEZhaWxXaXRoRXJyb3InKTtcbiAgICAgICAgdGhpcy5fZXZlbnQubm90aWZ5KHtcbiAgICAgICAgICAgIGV2ZW50TmFtZTogJ2NhbWVyYUNhcHR1cmVyRGlkRmFpbFdpdGhFcnJvcicsXG4gICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIGNhcHR1cmVyOiBjYXB0dXJlcixcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgZXZlbnRzKCk6IE9ic2VydmFibGUge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudDtcblxuICAgIH1cblxufVxuIl19
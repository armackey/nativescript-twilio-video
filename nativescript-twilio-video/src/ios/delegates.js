"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("tns-core-modules/data/observable");
var DelegateEvents = (function () {
    function DelegateEvents() {
    }
    return DelegateEvents;
}());
DelegateEvents._events = new observable_1.Observable();
exports.DelegateEvents = DelegateEvents;
var VideoViewDelegate = (function (_super) {
    __extends(VideoViewDelegate, _super);
    function VideoViewDelegate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VideoViewDelegate.initWithOwner = function (owner) {
        var videoViewDelegate = new VideoViewDelegate();
        videoViewDelegate._events = DelegateEvents._events;
        videoViewDelegate._owner = owner;
        return videoViewDelegate;
    };
    VideoViewDelegate.prototype.videoViewDidReceiveData = function (view) {
        console.log('videoViewDidReceiveData');
        if (this._events) {
            this._events.notify({
                eventName: 'videoViewDidReceiveData',
                object: observable_1.fromObject({
                    view: view,
                })
            });
        }
    };
    VideoViewDelegate.prototype.videoViewVideoDimensionsDidChange = function (view, dimensions) {
        console.log('videoDimensionsDidChange');
        if (this._events) {
            this._events.notify({
                eventName: 'videoDimensionsDidChange',
                object: observable_1.fromObject({
                    view: view,
                    dimensions: dimensions
                })
            });
        }
    };
    VideoViewDelegate.prototype.videoViewVideoOrientationDidChange = function (view, orientation) {
        console.log('videoViewVideoOrientationDidChange');
        if (this._events) {
            this._events.notify({
                eventName: 'videoViewVideoOrientationDidChange',
                object: observable_1.fromObject({
                    view: view,
                    orientation: orientation
                })
            });
        }
    };
    Object.defineProperty(VideoViewDelegate.prototype, "events", {
        get: function () {
            return this._events;
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
        cameraCapturerDelegate._events = DelegateEvents._events;
        cameraCapturerDelegate._owner = owner;
        return cameraCapturerDelegate;
    };
    CameraCapturerDelegate.prototype.cameraCapturerPreviewDidStart = function (capturer) {
        console.log('cameraCapturerPreviewDidStart');
        if (this._events) {
            this._events.notify({
                eventName: 'cameraCapturerPreviewDidStart',
                object: observable_1.fromObject({
                    capturer: capturer,
                })
            });
        }
    };
    CameraCapturerDelegate.prototype.cameraCapturerDidStartWithSource = function (capturer, didStartWithSource) {
        console.log('cameraCapturer didStartWithSource');
        if (this._events) {
            this._events.notify({
                eventName: 'cameraCapturer',
                object: observable_1.fromObject({
                    capturer: capturer,
                    didStartWith: didStartWithSource
                })
            });
        }
    };
    CameraCapturerDelegate.prototype.cameraCapturerWasInterrupted = function (capturer) {
        console.log('cameraCapturerWasInterrupted');
        if (this._events) {
            this._events.notify({
                eventName: 'cameraCapturerWasInterrupted',
                object: observable_1.fromObject({
                    capturer: capturer,
                })
            });
        }
    };
    CameraCapturerDelegate.prototype.cameraCapturerDidFailWithError = function (capturer) {
        console.log('didFailWithError');
        if (this._events) {
            this._events.notify({
                eventName: 'didFailWithError',
                object: observable_1.fromObject({
                    capturer: capturer,
                })
            });
        }
    };
    Object.defineProperty(CameraCapturerDelegate.prototype, "events", {
        get: function () {
            return this._events;
        },
        enumerable: true,
        configurable: true
    });
    return CameraCapturerDelegate;
}(NSObject));
CameraCapturerDelegate.ObjCProtocols = [TVICameraCapturerDelegate];
exports.CameraCapturerDelegate = CameraCapturerDelegate;
var RoomDelegate = (function (_super) {
    __extends(RoomDelegate, _super);
    function RoomDelegate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RoomDelegate.initWithOwner = function (owner) {
        var roomDelegate = new RoomDelegate();
        roomDelegate._events = DelegateEvents._events;
        roomDelegate._owner = owner;
        return roomDelegate;
    };
    RoomDelegate.prototype.didConnectToRoom = function (room) {
        if (this._events) {
            this._events.notify({
                eventName: 'onConnected',
                object: observable_1.fromObject({
                    room: room
                })
            });
        }
        console.log('connected to a room');
    };
    RoomDelegate.prototype.roomParticipantDidConnect = function (room, participant) {
        if (this._events) {
            this._events.notify({
                eventName: 'onParticipantConnected',
                object: observable_1.fromObject({
                    room: room,
                    participant: participant
                })
            });
        }
        console.log('participantDidConnect');
    };
    RoomDelegate.prototype.roomParticipantDidDisconnect = function (room, participant) {
        if (this._events) {
            this._events.notify({
                eventName: 'onParticipantDisconnected',
                object: observable_1.fromObject({
                    room: room,
                    participant: participant
                })
            });
        }
        console.log('participantDidDisconnect');
    };
    RoomDelegate.prototype.roomDidFailToConnectWithError = function (room, error) {
        if (this._events) {
            this._events.notify({
                eventName: 'onConnectFailure',
                object: observable_1.fromObject({
                    room: room,
                    error: error
                })
            });
        }
        console.log('didFailToConnectWithError');
    };
    ;
    RoomDelegate.prototype.roomDidDisconnectWithError = function (room, error) {
        if (this._events) {
            this._events.notify({
                eventName: 'didDisconnectWithError',
                object: observable_1.fromObject({
                    room: room,
                    error: error
                })
            });
        }
        console.log('didDisconnectWithError');
    };
    ;
    RoomDelegate.prototype.roomDidStartRecording = function (room) {
        if (this._events) {
            this._events.notify({
                eventName: 'roomDidStartRecording',
                object: observable_1.fromObject({
                    room: room,
                })
            });
        }
        console.log('roomDidStartRecording');
    };
    RoomDelegate.prototype.roomDidStopRecording = function (room) {
        if (this._events) {
            this._events.notify({
                eventName: 'roomDidStopRecording',
                object: observable_1.fromObject({
                    room: room,
                })
            });
        }
        console.log('roomDidStopRecording');
    };
    Object.defineProperty(RoomDelegate.prototype, "events", {
        get: function () {
            return this._events;
        },
        enumerable: true,
        configurable: true
    });
    return RoomDelegate;
}(NSObject));
RoomDelegate.ObjCProtocols = [TVIRoomDelegate];
exports.RoomDelegate = RoomDelegate;
var ParticipantDelegate = (function (_super) {
    __extends(ParticipantDelegate, _super);
    function ParticipantDelegate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ParticipantDelegate.initWithOwner = function (owner) {
        var participantDelegate = new ParticipantDelegate();
        participantDelegate._events = DelegateEvents._events;
        participantDelegate._owner = owner;
        return participantDelegate;
    };
    ParticipantDelegate.prototype.participantAddedVideoTrack = function (participant, videoTrack) {
        if (this._events) {
            this._events.notify({
                eventName: 'onVideoTrackAdded',
                object: observable_1.fromObject({
                    participant: participant,
                    videoTrack: videoTrack
                })
            });
        }
    };
    ParticipantDelegate.prototype.participantRemovedVideoTrack = function (participant, videoTrack) {
        console.log('onVideoTrackRemoved');
        if (this._events) {
            this._events.notify({
                eventName: 'onVideoTrackRemoved',
                object: observable_1.fromObject({
                    participant: participant,
                    videoTrack: videoTrack
                })
            });
        }
    };
    ParticipantDelegate.prototype.participantAddedAudioTrack = function (participant, audioTrack) {
        console.log('onAudioTrackAdded');
        if (this._events) {
            this._events.notify({
                eventName: 'onAudioTrackAdded',
                object: observable_1.fromObject({
                    participant: participant,
                    videoTrack: audioTrack
                })
            });
        }
    };
    ParticipantDelegate.prototype.participantRemovedAudioTrack = function (participant, audioTrack) {
        console.log('onAudioTrackRemoved');
        if (this._events) {
            this._events.notify({
                eventName: 'onAudioTrackRemoved',
                object: observable_1.fromObject({
                    participant: participant,
                    videoTrack: audioTrack
                })
            });
        }
    };
    ParticipantDelegate.prototype.participantEnabledTrack = function (participant, track) {
        console.log('enabledTrack(p');
    };
    ParticipantDelegate.prototype.participantDisabledTrack = function (participant, track) {
        console.log('disabledTrack(');
    };
    Object.defineProperty(ParticipantDelegate.prototype, "events", {
        get: function () {
            return this._events;
        },
        enumerable: true,
        configurable: true
    });
    return ParticipantDelegate;
}(NSObject));
ParticipantDelegate.ObjCProtocols = [TVIParticipantDelegate];
exports.ParticipantDelegate = ParticipantDelegate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZWdhdGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVsZWdhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0RBQTBFO0FBSTFFO0lBQUE7SUFJQSxDQUFDO0lBQUQscUJBQUM7QUFBRCxDQUFDLEFBSkQ7QUFFVyxzQkFBTyxHQUFlLElBQUksdUJBQVUsRUFBRSxDQUFDO0FBRnJDLHdDQUFjO0FBTTNCO0lBQXVDLHFDQUFRO0lBQS9DOztJQWlFQSxDQUFDO0lBekRpQiwrQkFBYSxHQUEzQixVQUE0QixLQUFtQjtRQUUzQyxJQUFJLGlCQUFpQixHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUVoRCxpQkFBaUIsQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQTtRQUVsRCxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRWpDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztJQUU3QixDQUFDO0lBR00sbURBQXVCLEdBQTlCLFVBQStCLElBQVM7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQ2hCLFNBQVMsRUFBRSx5QkFBeUI7Z0JBQ3BDLE1BQU0sRUFBRSx1QkFBVSxDQUFDO29CQUNmLElBQUksRUFBRSxJQUFJO2lCQUNiLENBQUM7YUFDTCxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztJQUVNLDZEQUFpQyxHQUF4QyxVQUF5QyxJQUFTLEVBQUUsVUFBZTtRQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDeEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztnQkFDaEIs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LE9BQU8sQ0FBQztRQUV4QixDQUFDOzs7T0FBQTtJQUVMLDBCQUFDO0FBQUQsQ0FBQyxBQXZGRCxDQUF5QyxRQUFRO0FBRXRDLGlDQUFhLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBRnZDLGtEQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUsIGZyb21PYmplY3QgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2RhdGEvb2JzZXJ2YWJsZSc7XG5cbmRlY2xhcmUgdmFyIFRWSVZpZGVvVmlld0RlbGVnYXRlLCBUVklDYW1lcmFDYXB0dXJlckRlbGVnYXRlLCBUVklQYXJ0aWNpcGFudERlbGVnYXRlLCBUVklSb29tRGVsZWdhdGU7XG5cbmV4cG9ydCBjbGFzcyBEZWxlZ2F0ZUV2ZW50cyB7XG5cbiAgICBzdGF0aWMgX2V2ZW50czogT2JzZXJ2YWJsZSA9IG5ldyBPYnNlcnZhYmxlKCk7XG5cbn1cblxuZXhwb3J0IGNsYXNzIFZpZGVvVmlld0RlbGVnYXRlIGV4dGVuZHMgTlNPYmplY3Qge1xuXG4gICAgcHVibGljIHN0YXRpYyBPYmpDUHJvdG9jb2xzID0gW1RWSVZpZGVvVmlld0RlbGVnYXRlXTtcblxuICAgIHByaXZhdGUgX2V2ZW50czogT2JzZXJ2YWJsZTtcblxuICAgIHByaXZhdGUgX293bmVyOiBXZWFrUmVmPGFueT47XG5cbiAgICBwdWJsaWMgc3RhdGljIGluaXRXaXRoT3duZXIob3duZXI6IFdlYWtSZWY8YW55Pik6IFZpZGVvVmlld0RlbGVnYXRlIHtcblxuICAgICAgICBsZXQgdmlkZW9WaWV3RGVsZWdhdGUgPSBuZXcgVmlkZW9WaWV3RGVsZWdhdGUoKTtcblxuICAgICAgICB2aWRlb1ZpZXdEZWxlZ2F0ZS5fZXZlbnRzID0gRGVsZWdhdGVFdmVudHMuX2V2ZW50c1xuXG4gICAgICAgIHZpZGVvVmlld0RlbGVnYXRlLl9vd25lciA9IG93bmVyO1xuXG4gICAgICAgIHJldHVybiB2aWRlb1ZpZXdEZWxlZ2F0ZTtcblxuICAgIH1cblxuXG4gICAgcHVibGljIHZpZGVvVmlld0RpZFJlY2VpdmVEYXRhKHZpZXc6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZygndmlkZW9WaWV3RGlkUmVjZWl2ZURhdGEnKTtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgZXZlbnROYW1lOiAndmlkZW9WaWV3RGlkUmVjZWl2ZURhdGEnLFxuICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIHZpZXc6IHZpZXcsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHZpZGVvVmlld1ZpZGVvRGltZW5zaW9uc0RpZENoYW5nZSh2aWV3OiBhbnksIGRpbWVuc2lvbnM6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZygndmlkZW9EaW1lbnNpb25zRGlkQ2hhbmdlJyk7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3ZpZGVvRGltZW5zaW9uc0RpZENoYW5nZScsXG4gICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgdmlldzogdmlldyxcbiAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uczogZGltZW5zaW9uc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyB2aWRlb1ZpZXdWaWRlb09yaWVudGF0aW9uRGlkQ2hhbmdlKHZpZXc6IGFueSwgb3JpZW50YXRpb246IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZygndmlkZW9WaWV3VmlkZW9PcmllbnRhdGlvbkRpZENoYW5nZScpO1xuICAgICAgICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBldmVudE5hbWU6ICd2aWRlb1ZpZXdWaWRlb09yaWVudGF0aW9uRGlkQ2hhbmdlJyxcbiAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICB2aWV3OiB2aWV3LFxuICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogb3JpZW50YXRpb25cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgZXZlbnRzKCk6IE9ic2VydmFibGUge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudHM7XG5cbiAgICB9XG5cbn1cblxuXG5leHBvcnQgY2xhc3MgQ2FtZXJhQ2FwdHVyZXJEZWxlZ2F0ZSBleHRlbmRzIE5TT2JqZWN0IHtcblxuICAgIHB1YmxpYyBzdGF0aWMgT2JqQ1Byb3RvY29scyA9IFtUVklDYW1lcmFDYXB0dXJlckRlbGVnYXRlXTsgLy8gZGVmaW5lIG91ciBuYXRpdmUgcHJvdG9jYWxsc1xuXG4gICAgcHJpdmF0ZSBfZXZlbnRzOiBPYnNlcnZhYmxlO1xuXG4gICAgcHJpdmF0ZSBfb3duZXI6IFdlYWtSZWY8YW55PjtcblxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdFdpdGhPd25lcihvd25lcjogV2Vha1JlZjxhbnk+KTogQ2FtZXJhQ2FwdHVyZXJEZWxlZ2F0ZSB7XG5cbiAgICAgICAgbGV0IGNhbWVyYUNhcHR1cmVyRGVsZWdhdGUgPSBuZXcgQ2FtZXJhQ2FwdHVyZXJEZWxlZ2F0ZSgpO1xuXG4gICAgICAgIGNhbWVyYUNhcHR1cmVyRGVsZWdhdGUuX2V2ZW50cyA9IERlbGVnYXRlRXZlbnRzLl9ldmVudHNcblxuICAgICAgICBjYW1lcmFDYXB0dXJlckRlbGVnYXRlLl9vd25lciA9IG93bmVyO1xuXG4gICAgICAgIHJldHVybiBjYW1lcmFDYXB0dXJlckRlbGVnYXRlO1xuXG4gICAgfVxuXG4gICAgcHVibGljIGNhbWVyYUNhcHR1cmVyUHJldmlld0RpZFN0YXJ0KGNhcHR1cmVyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2NhbWVyYUNhcHR1cmVyUHJldmlld0RpZFN0YXJ0Jyk7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ2NhbWVyYUNhcHR1cmVyUHJldmlld0RpZFN0YXJ0JyxcbiAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBjYXB0dXJlcjogY2FwdHVyZXIsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNhbWVyYUNhcHR1cmVyRGlkU3RhcnRXaXRoU291cmNlKGNhcHR1cmVyOiBhbnksIGRpZFN0YXJ0V2l0aFNvdXJjZTogYW55KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjYW1lcmFDYXB0dXJlciBkaWRTdGFydFdpdGhTb3VyY2UnKTtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnY2FtZXJhQ2FwdHVyZXInLFxuICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIGNhcHR1cmVyOiBjYXB0dXJlcixcbiAgICAgICAgICAgICAgICAgICAgZGlkU3RhcnRXaXRoOiBkaWRTdGFydFdpdGhTb3VyY2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHB1YmxpYyBjYW1lcmFDYXB0dXJlcldhc0ludGVycnVwdGVkKGNhcHR1cmVyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2NhbWVyYUNhcHR1cmVyV2FzSW50ZXJydXB0ZWQnKTtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnY2FtZXJhQ2FwdHVyZXJXYXNJbnRlcnJ1cHRlZCcsXG4gICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgY2FwdHVyZXI6IGNhcHR1cmVyLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjYW1lcmFDYXB0dXJlckRpZEZhaWxXaXRoRXJyb3IoY2FwdHVyZXI6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZGlkRmFpbFdpdGhFcnJvcicpO1xuICAgICAgICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdkaWRGYWlsV2l0aEVycm9yJyxcbiAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBjYXB0dXJlcjogY2FwdHVyZXIsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGV2ZW50cygpOiBPYnNlcnZhYmxlIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRzO1xuXG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBSb29tRGVsZWdhdGUgZXh0ZW5kcyBOU09iamVjdCB7XG5cbiAgICBzdGF0aWMgT2JqQ1Byb3RvY29scyA9IFtUVklSb29tRGVsZWdhdGVdOyAvLyBkZWZpbmUgb3VyIG5hdGl2ZSBwcm90b2NhbGxzXG5cbiAgICBwcml2YXRlIF9ldmVudHM6IE9ic2VydmFibGU7XG5cbiAgICBwcml2YXRlIF9vd25lcjogV2Vha1JlZjxhbnk+O1xuXG4gICAgcHVibGljIF9wYXJ0aWNpcGFudERlbGVnYXRlOiBQYXJ0aWNpcGFudERlbGVnYXRlO1xuXG4gICAgcHVibGljIHN0YXRpYyBpbml0V2l0aE93bmVyKG93bmVyOiBXZWFrUmVmPGFueT4pOiBSb29tRGVsZWdhdGUge1xuXG4gICAgICAgIGxldCByb29tRGVsZWdhdGUgPSBuZXcgUm9vbURlbGVnYXRlKCk7XG5cbiAgICAgICAgcm9vbURlbGVnYXRlLl9ldmVudHMgPSBEZWxlZ2F0ZUV2ZW50cy5fZXZlbnRzXG5cbiAgICAgICAgcm9vbURlbGVnYXRlLl9vd25lciA9IG93bmVyO1xuXG4gICAgICAgIHJldHVybiByb29tRGVsZWdhdGU7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZGlkQ29ubmVjdFRvUm9vbShyb29tKTogdm9pZCB7XG5cbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25Db25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIHJvb206IHJvb21cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnY29ubmVjdGVkIHRvIGEgcm9vbScpO1xuICAgIH0gICAgXG5cbiAgICBwdWJsaWMgcm9vbVBhcnRpY2lwYW50RGlkQ29ubmVjdChyb29tLCBwYXJ0aWNpcGFudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblBhcnRpY2lwYW50Q29ubmVjdGVkJyxcbiAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdwYXJ0aWNpcGFudERpZENvbm5lY3QnKTtcblxuICAgIH1cbiAgICBwdWJsaWMgcm9vbVBhcnRpY2lwYW50RGlkRGlzY29ubmVjdChyb29tLCBwYXJ0aWNpcGFudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblBhcnRpY2lwYW50RGlzY29ubmVjdGVkJyxcbiAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygncGFydGljaXBhbnREaWREaXNjb25uZWN0Jyk7XG4gICAgfVxuXG5cblxuICAgIHB1YmxpYyByb29tRGlkRmFpbFRvQ29ubmVjdFdpdGhFcnJvcihyb29tLCBlcnJvcik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkNvbm5lY3RGYWlsdXJlJyxcbiAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnZGlkRmFpbFRvQ29ubmVjdFdpdGhFcnJvcicpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcm9vbURpZERpc2Nvbm5lY3RXaXRoRXJyb3Iocm9vbSwgZXJyb3IpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnZGlkRGlzY29ubmVjdFdpdGhFcnJvcicsXG4gICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ2RpZERpc2Nvbm5lY3RXaXRoRXJyb3InKVxuICAgIH07XG5cbiAgICByb29tRGlkU3RhcnRSZWNvcmRpbmcocm9vbSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdyb29tRGlkU3RhcnRSZWNvcmRpbmcnLFxuICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ3Jvb21EaWRTdGFydFJlY29yZGluZycpXG4gICAgfVxuICAgIHJvb21EaWRTdG9wUmVjb3JkaW5nKHJvb20pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgZXZlbnROYW1lOiAncm9vbURpZFN0b3BSZWNvcmRpbmcnLFxuICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ3Jvb21EaWRTdG9wUmVjb3JkaW5nJylcbiAgICB9XG5cbiAgICBnZXQgZXZlbnRzKCk6IE9ic2VydmFibGUge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudHM7XG5cbiAgICB9XG5cbn1cblxuXG5leHBvcnQgY2xhc3MgUGFydGljaXBhbnREZWxlZ2F0ZSBleHRlbmRzIE5TT2JqZWN0IHtcblxuICAgIHN0YXRpYyBPYmpDUHJvdG9jb2xzID0gW1RWSVBhcnRpY2lwYW50RGVsZWdhdGVdOyAvLyBkZWZpbmUgb3VyIG5hdGl2ZSBwcm90b2NhbGxzXG5cbiAgICBwcml2YXRlIF9ldmVudHM6IE9ic2VydmFibGU7XG4gICAgcHJpdmF0ZSBfb3duZXI6IFdlYWtSZWY8YW55PjtcblxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdFdpdGhPd25lcihvd25lcjogV2Vha1JlZjxhbnk+KTogUGFydGljaXBhbnREZWxlZ2F0ZSB7XG5cbiAgICAgICAgbGV0IHBhcnRpY2lwYW50RGVsZWdhdGUgPSBuZXcgUGFydGljaXBhbnREZWxlZ2F0ZSgpO1xuXG4gICAgICAgIHBhcnRpY2lwYW50RGVsZWdhdGUuX2V2ZW50cyA9IERlbGVnYXRlRXZlbnRzLl9ldmVudHNcblxuICAgICAgICBwYXJ0aWNpcGFudERlbGVnYXRlLl9vd25lciA9IG93bmVyO1xuXG4gICAgICAgIHJldHVybiBwYXJ0aWNpcGFudERlbGVnYXRlO1xuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRBZGRlZFZpZGVvVHJhY2socGFydGljaXBhbnQsIHZpZGVvVHJhY2spOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgZXZlbnROYW1lOiAnb25WaWRlb1RyYWNrQWRkZWQnLFxuICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9UcmFjazogdmlkZW9UcmFja1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgcGFydGljaXBhbnRSZW1vdmVkVmlkZW9UcmFjayhwYXJ0aWNpcGFudCwgdmlkZW9UcmFjayk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnb25WaWRlb1RyYWNrUmVtb3ZlZCcpO1xuICAgICAgICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvblZpZGVvVHJhY2tSZW1vdmVkJyxcbiAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudDogcGFydGljaXBhbnQsXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvVHJhY2s6IHZpZGVvVHJhY2tcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSAgICAgICAgXG4gICAgfVxuXG4gICAgcHVibGljIHBhcnRpY2lwYW50QWRkZWRBdWRpb1RyYWNrKHBhcnRpY2lwYW50LCBhdWRpb1RyYWNrKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdvbkF1ZGlvVHJhY2tBZGRlZCcpO1xuICAgICAgICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBldmVudE5hbWU6ICdvbkF1ZGlvVHJhY2tBZGRlZCcsXG4gICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICAgICAgICAgICAgICB2aWRlb1RyYWNrOiBhdWRpb1RyYWNrXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gIFxuICAgIH1cblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudFJlbW92ZWRBdWRpb1RyYWNrKHBhcnRpY2lwYW50LCBhdWRpb1RyYWNrKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdvbkF1ZGlvVHJhY2tSZW1vdmVkJyk7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ29uQXVkaW9UcmFja1JlbW92ZWQnLFxuICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50OiBwYXJ0aWNpcGFudCxcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9UcmFjazogYXVkaW9UcmFja1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICB9IFxuICAgIH1cblxuICAgIHB1YmxpYyBwYXJ0aWNpcGFudEVuYWJsZWRUcmFjayhwYXJ0aWNpcGFudCwgdHJhY2spOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2VuYWJsZWRUcmFjayhwJyk7XG4gICAgfVxuXG4gICAgcHVibGljIHBhcnRpY2lwYW50RGlzYWJsZWRUcmFjayhwYXJ0aWNpcGFudCwgdHJhY2spOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2Rpc2FibGVkVHJhY2soJyk7XG4gICAgfVxuXG5cbiAgICBnZXQgZXZlbnRzKCk6IE9ic2VydmFibGUge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudHM7XG5cbiAgICB9XG5cbn0iXX0=
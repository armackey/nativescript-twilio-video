"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var utils = require("tns-core-modules/utils/utils");
var app = require("application");
var CameraCapturer = com.twilio.video.CameraCapturer;
var LocalParticipant = com.twilio.video.LocalParticipant;
var LocalAudioTrack = com.twilio.video.LocalAudioTrack;
var LocalVideoTrack = com.twilio.video.LocalVideoTrack;
var VideoView = com.twilio.video.VideoView;
var videoView = new VideoView(utils.ad.getApplicationContext());
var LocalVideo = (function (_super) {
    __extends(LocalVideo, _super);
    function LocalVideo() {
        var _this = _super.call(this) || this;
        _this.localVideoView = videoView;
        return _this;
    }
    Object.defineProperty(LocalVideo.prototype, "android", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    LocalVideo.prototype.createNativeView = function () {
        return new android.widget.LinearLayout(utils.ad.getApplicationContext());
    };
    LocalVideo.prototype.initNativeView = function () {
        this.nativeView.addView(videoView);
    };
    LocalVideo.prototype.get_local_view = function () {
        return this.localVideoView;
    };
    return LocalVideo;
}(view_1.View));
exports.LocalVideo = LocalVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBb0M7QUFDcEMsb0RBQXNEO0FBRXRELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUlqQyxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7QUFDdkQsSUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztBQUMzRCxJQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7QUFDekQsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO0FBRXpELElBQU0sU0FBUyxHQUFRLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFNLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztBQUVsRTtJQUFnQyw4QkFBSTtJQUloQztRQUFBLFlBQ0ksaUJBQU8sU0FDVjtRQUpPLG9CQUFjLEdBQVEsU0FBUyxDQUFDOztJQUl4QyxDQUFDO0lBRUQsc0JBQUksK0JBQU87YUFBWDtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTNCLENBQUM7OztPQUFBO0lBRU0scUNBQWdCLEdBQXZCO1FBRUksTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7SUFFN0UsQ0FBQztJQUdNLG1DQUFjLEdBQXJCO1FBRUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUUsU0FBUyxDQUFFLENBQUM7SUFFekMsQ0FBQztJQUVNLG1DQUFjLEdBQXJCO1FBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7SUFFL0IsQ0FBQztJQUdMLGlCQUFDO0FBQUQsQ0FBQyxBQWxDRCxDQUFnQyxXQUFJLEdBa0NuQztBQWxDWSxnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZpZXcgfSBmcm9tICd1aS9jb3JlL3ZpZXcnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHNcIjtcblxudmFyIGFwcCA9IHJlcXVpcmUoXCJhcHBsaWNhdGlvblwiKTtcblxuZGVjbGFyZSB2YXIgY29tLCBhbmRyb2lkOiBhbnk7XG5cbmNvbnN0IENhbWVyYUNhcHR1cmVyID0gY29tLnR3aWxpby52aWRlby5DYW1lcmFDYXB0dXJlcjtcbmNvbnN0IExvY2FsUGFydGljaXBhbnQgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsUGFydGljaXBhbnQ7XG5jb25zdCBMb2NhbEF1ZGlvVHJhY2sgPSBjb20udHdpbGlvLnZpZGVvLkxvY2FsQXVkaW9UcmFjaztcbmNvbnN0IExvY2FsVmlkZW9UcmFjayA9IGNvbS50d2lsaW8udmlkZW8uTG9jYWxWaWRlb1RyYWNrO1xuXG5jb25zdCBWaWRlb1ZpZXc6IGFueSA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9WaWV3O1xuY29uc3QgdmlkZW9WaWV3ID0gbmV3IFZpZGVvVmlldyh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSk7XG5cbmV4cG9ydCBjbGFzcyBMb2NhbFZpZGVvIGV4dGVuZHMgVmlldyB7XG5cbiAgICBwcml2YXRlIGxvY2FsVmlkZW9WaWV3OiBhbnkgPSB2aWRlb1ZpZXc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBnZXQgYW5kcm9pZCgpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5hdGl2ZVZpZXc7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlTmF0aXZlVmlldygpIHtcblxuICAgICAgICByZXR1cm4gbmV3IGFuZHJvaWQud2lkZ2V0LkxpbmVhckxheW91dCh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSk7XG5cbiAgICB9XG5cblxuICAgIHB1YmxpYyBpbml0TmF0aXZlVmlldygpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLm5hdGl2ZVZpZXcuYWRkVmlldyggdmlkZW9WaWV3ICk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0X2xvY2FsX3ZpZXcoKTogYW55IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbFZpZGVvVmlldztcblxuICAgIH1cblxuXG59Il19
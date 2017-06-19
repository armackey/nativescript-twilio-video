"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var utils = require("tns-core-modules/utils/utils");
var app = require("application");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBb0M7QUFDcEMsb0RBQXNEO0FBRXRELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUlqQyxJQUFNLFNBQVMsR0FBUSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDbEQsSUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7QUFFbEU7SUFBZ0MsOEJBQUk7SUFJaEM7UUFBQSxZQUNJLGlCQUFPLFNBQ1Y7UUFKTyxvQkFBYyxHQUFRLFNBQVMsQ0FBQzs7SUFJeEMsQ0FBQztJQUVELHNCQUFJLCtCQUFPO2FBQVg7WUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUUzQixDQUFDOzs7T0FBQTtJQUVNLHFDQUFnQixHQUF2QjtRQUVJLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO0lBRTdFLENBQUM7SUFHTSxtQ0FBYyxHQUFyQjtRQUVJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFFLFNBQVMsQ0FBRSxDQUFDO0lBRXpDLENBQUM7SUFFTSxtQ0FBYyxHQUFyQjtRQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBRS9CLENBQUM7SUFHTCxpQkFBQztBQUFELENBQUMsQUFsQ0QsQ0FBZ0MsV0FBSSxHQWtDbkM7QUFsQ1ksZ0NBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3IH0gZnJvbSAndWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5cbnZhciBhcHAgPSByZXF1aXJlKFwiYXBwbGljYXRpb25cIik7XG5cbmRlY2xhcmUgdmFyIGNvbSwgYW5kcm9pZDogYW55O1xuXG5jb25zdCBWaWRlb1ZpZXc6IGFueSA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9WaWV3O1xuY29uc3QgdmlkZW9WaWV3ID0gbmV3IFZpZGVvVmlldyh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSk7XG5cbmV4cG9ydCBjbGFzcyBMb2NhbFZpZGVvIGV4dGVuZHMgVmlldyB7XG5cbiAgICBwcml2YXRlIGxvY2FsVmlkZW9WaWV3OiBhbnkgPSB2aWRlb1ZpZXc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBnZXQgYW5kcm9pZCgpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5hdGl2ZVZpZXc7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlTmF0aXZlVmlldygpIHtcblxuICAgICAgICByZXR1cm4gbmV3IGFuZHJvaWQud2lkZ2V0LkxpbmVhckxheW91dCh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSk7XG5cbiAgICB9XG5cblxuICAgIHB1YmxpYyBpbml0TmF0aXZlVmlldygpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLm5hdGl2ZVZpZXcuYWRkVmlldyggdmlkZW9WaWV3ICk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0X2xvY2FsX3ZpZXcoKTogYW55IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbFZpZGVvVmlldztcblxuICAgIH1cblxuXG59Il19
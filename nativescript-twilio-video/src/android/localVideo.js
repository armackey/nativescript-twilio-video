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
    LocalVideo.prototype.disposeNativeView = function () {
        this.nativeView = null;
    };
    LocalVideo.prototype.get_local_view = function () {
        return this.localVideoView;
    };
    return LocalVideo;
}(view_1.View));
exports.LocalVideo = LocalVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBb0M7QUFDcEMsb0RBQXNEO0FBRXRELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUlqQyxJQUFNLFNBQVMsR0FBUSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDbEQsSUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7QUFFbEU7SUFBZ0MsOEJBQUk7SUFJaEM7UUFBQSxZQUNJLGlCQUFPLFNBQ1Y7UUFKTyxvQkFBYyxHQUFRLFNBQVMsQ0FBQzs7SUFJeEMsQ0FBQztJQUVELHNCQUFJLCtCQUFPO2FBQVg7WUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUUzQixDQUFDOzs7T0FBQTtJQUVNLHFDQUFnQixHQUF2QjtRQUVJLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO0lBRTdFLENBQUM7SUFHTSxtQ0FBYyxHQUFyQjtRQUVJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFFLFNBQVMsQ0FBRSxDQUFDO0lBRXpDLENBQUM7SUFFTSxzQ0FBaUIsR0FBeEI7UUFFSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUUzQixDQUFDO0lBRU0sbUNBQWMsR0FBckI7UUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUUvQixDQUFDO0lBR0wsaUJBQUM7QUFBRCxDQUFDLEFBeENELENBQWdDLFdBQUksR0F3Q25DO0FBeENZLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91dGlscy91dGlsc1wiO1xuXG52YXIgYXBwID0gcmVxdWlyZShcImFwcGxpY2F0aW9uXCIpO1xuXG5kZWNsYXJlIHZhciBjb20sIGFuZHJvaWQ6IGFueTtcblxuY29uc3QgVmlkZW9WaWV3OiBhbnkgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvVmlldztcbmNvbnN0IHZpZGVvVmlldyA9IG5ldyBWaWRlb1ZpZXcodXRpbHMuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCkpO1xuXG5leHBvcnQgY2xhc3MgTG9jYWxWaWRlbyBleHRlbmRzIFZpZXcge1xuXG4gICAgcHJpdmF0ZSBsb2NhbFZpZGVvVmlldzogYW55ID0gdmlkZW9WaWV3O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgZ2V0IGFuZHJvaWQoKTogYW55IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5uYXRpdmVWaWV3O1xuXG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZU5hdGl2ZVZpZXcoKSB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBhbmRyb2lkLndpZGdldC5MaW5lYXJMYXlvdXQodXRpbHMuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCkpO1xuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaW5pdE5hdGl2ZVZpZXcoKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5uYXRpdmVWaWV3LmFkZFZpZXcoIHZpZGVvVmlldyApO1xuXG4gICAgfVxuXG4gICAgcHVibGljIGRpc3Bvc2VOYXRpdmVWaWV3KCkge1xuXG4gICAgICAgIHRoaXMubmF0aXZlVmlldyA9IG51bGw7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0X2xvY2FsX3ZpZXcoKTogYW55IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbFZpZGVvVmlldztcblxuICAgIH1cblxuXG59Il19
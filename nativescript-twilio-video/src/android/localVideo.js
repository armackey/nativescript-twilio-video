"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var utils = require("tns-core-modules/utils/utils");
var LocalVideo = (function (_super) {
    __extends(LocalVideo, _super);
    function LocalVideo() {
        var _this = _super.call(this) || this;
        _this.localVideoView = new com.twilio.video.VideoView(utils.ad.getApplicationContext());
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
        return this.localVideoView;
    };
    LocalVideo.prototype.disposeNativeView = function () {
        this.nativeView = null;
    };
    return LocalVideo;
}(view_1.View));
exports.LocalVideo = LocalVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBb0M7QUFDcEMsb0RBQXNEO0FBU3REO0lBQWdDLDhCQUFJO0lBSWhDO1FBQUEsWUFDSSxpQkFBTyxTQUVWO1FBREcsS0FBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQzs7SUFDM0YsQ0FBQztJQUVELHNCQUFJLCtCQUFPO2FBQVg7WUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUUzQixDQUFDOzs7T0FBQTtJQUVNLHFDQUFnQixHQUF2QjtRQUdJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBRS9CLENBQUM7SUFTTSxzQ0FBaUIsR0FBeEI7UUFFSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUUzQixDQUFDO0lBV0wsaUJBQUM7QUFBRCxDQUFDLEFBNUNELENBQWdDLFdBQUksR0E0Q25DO0FBNUNZLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91dGlscy91dGlsc1wiO1xuXG4vLyB2YXIgYXBwID0gcmVxdWlyZShcImFwcGxpY2F0aW9uXCIpO1xuXG5kZWNsYXJlIHZhciBjb20sIGFuZHJvaWQ6IGFueTtcblxuLy8gY29uc3QgVmlkZW9WaWV3OiBhbnkgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvVmlldztcbi8vIGNvbnN0IHZpZGVvVmlldyA9IG5ldyBWaWRlb1ZpZXcodXRpbHMuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCkpO1xuXG5leHBvcnQgY2xhc3MgTG9jYWxWaWRlbyBleHRlbmRzIFZpZXcge1xuXG4gICAgbG9jYWxWaWRlb1ZpZXc6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9WaWV3ID0gbmV3IGNvbS50d2lsaW8udmlkZW8uVmlkZW9WaWV3KHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpKTtcbiAgICB9XG5cbiAgICBnZXQgYW5kcm9pZCgpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5hdGl2ZVZpZXc7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlTmF0aXZlVmlldygpIHtcblxuICAgICAgICAvLyByZXR1cm4gbmV3IGFuZHJvaWQud2lkZ2V0LkxpbmVhckxheW91dCh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsVmlkZW9WaWV3O1xuXG4gICAgfVxuXG5cbiAgICAvLyBwdWJsaWMgaW5pdE5hdGl2ZVZpZXcoKTogdm9pZCB7XG5cbiAgICAvLyAgICAgLy8gdGhpcy5uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy5sb2NhbFZpZGVvVmlldyk7XG5cbiAgICAvLyB9XG5cbiAgICBwdWJsaWMgZGlzcG9zZU5hdGl2ZVZpZXcoKSB7XG5cbiAgICAgICAgdGhpcy5uYXRpdmVWaWV3ID0gbnVsbDtcblxuICAgIH1cblxuICAgIC8vIHB1YmxpYyByZW1vdmVWaWRlb1ZpZXcoKSB7XG5cbiAgICAvLyAgICAgdGhpcy5uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5sb2NhbFZpZGVvVmlldyk7XG5cbiAgICAvLyB9XG5cblxuXG5cbn0iXX0=
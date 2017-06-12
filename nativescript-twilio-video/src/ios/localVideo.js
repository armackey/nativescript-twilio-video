"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var app = require("application");
var rect = {
    origin: {
        x: 0,
        y: 0
    },
    size: {
        width: 0,
        height: 0
    }
};
var videoView = TVIVideoView.init(rect);
var LocalVideo = (function (_super) {
    __extends(LocalVideo, _super);
    function LocalVideo() {
        var _this = _super.call(this) || this;
        _this.localVideoView = videoView;
        return _this;
    }
    Object.defineProperty(LocalVideo.prototype, "ios", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    LocalVideo.prototype.createNativeView = function () {
        return UIView.new();
    };
    LocalVideo.prototype.initNativeView = function () {
        this.nativeView.insertSubviewAtIndex(this.localVideoView, 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBb0M7QUFJcEMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBR2pDLElBQUksSUFBSSxHQUFHO0lBQ1AsTUFBTSxFQUFFO1FBQ0osQ0FBQyxFQUFFLENBQUM7UUFDSixDQUFDLEVBQUUsQ0FBQztLQUNQO0lBQ0QsSUFBSSxFQUFFO1FBQ0YsS0FBSyxFQUFFLENBQUM7UUFDUixNQUFNLEVBQUUsQ0FBQztLQUNaO0NBQ0osQ0FBQztBQUdGLElBQU0sU0FBUyxHQUFRLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFL0M7SUFBZ0MsOEJBQUk7SUFLaEM7UUFBQSxZQUNJLGlCQUFPLFNBQ1Y7UUFKTyxvQkFBYyxHQUFRLFNBQVMsQ0FBQzs7SUFJeEMsQ0FBQztJQUdELHNCQUFJLDJCQUFHO2FBQVA7WUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUUzQixDQUFDOzs7T0FBQTtJQUVNLHFDQUFnQixHQUF2QjtRQUVJLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFeEIsQ0FBQztJQUdNLG1DQUFjLEdBQXJCO1FBRUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBRSxJQUFJLENBQUMsY0FBYyxFQUFHLENBQUMsQ0FBRSxDQUFDO0lBRXBFLENBQUM7SUFFTSxzQ0FBaUIsR0FBeEI7UUFFSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUUzQixDQUFDO0lBRU0sbUNBQWMsR0FBckI7UUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUUvQixDQUFDO0lBR0wsaUJBQUM7QUFBRCxDQUFDLEFBMUNELENBQWdDLFdBQUksR0EwQ25DO0FBMUNZLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91dGlscy91dGlsc1wiO1xuXG5cbnZhciBhcHAgPSByZXF1aXJlKFwiYXBwbGljYXRpb25cIik7XG5cbmRlY2xhcmUgdmFyIGNvbSwgVFZJVmlkZW9WaWV3O1xubGV0IHJlY3QgPSB7XG4gICAgb3JpZ2luOiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9LFxuICAgIHNpemU6IHtcbiAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgIGhlaWdodDogMFxuICAgIH1cbn07XG5cbi8vIENHUmVjdFxuY29uc3QgdmlkZW9WaWV3OiBhbnkgPSBUVklWaWRlb1ZpZXcuaW5pdChyZWN0KTtcblxuZXhwb3J0IGNsYXNzIExvY2FsVmlkZW8gZXh0ZW5kcyBWaWV3IHtcbiAgICBcbiAgICBuYXRpdmVWaWV3OiBVSVZpZXc7XG4gICAgcHJpdmF0ZSBsb2NhbFZpZGVvVmlldzogYW55ID0gdmlkZW9WaWV3O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gIFxuICAgIGdldCBpb3MoKTogYW55IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5uYXRpdmVWaWV3O1xuXG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZU5hdGl2ZVZpZXcoKSB7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gVUlWaWV3Lm5ldygpOyBcblxuICAgIH1cblxuXG4gICAgcHVibGljIGluaXROYXRpdmVWaWV3KCk6IHZvaWQge1xuXG4gICAgICAgIHRoaXMubmF0aXZlVmlldy5pbnNlcnRTdWJ2aWV3QXRJbmRleCggdGhpcy5sb2NhbFZpZGVvVmlldyAsIDAgKTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBkaXNwb3NlTmF0aXZlVmlldygpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubmF0aXZlVmlldyA9IG51bGw7XG5cbiAgICB9ICBcblxuICAgIHB1YmxpYyBnZXRfbG9jYWxfdmlldygpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsVmlkZW9WaWV3O1xuXG4gICAgfVxuXG5cbn0iXX0=
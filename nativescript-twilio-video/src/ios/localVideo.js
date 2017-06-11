"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var app = require("application");
var videoView = TVICameraCapturer();
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
        this.nativeView.addView(videoView);
    };
    LocalVideo.prototype.get_local_view = function () {
        return this.localVideoView;
    };
    return LocalVideo;
}(view_1.View));
exports.LocalVideo = LocalVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBb0M7QUFJcEMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBTWpDLElBQU0sU0FBUyxHQUFRLGlCQUFpQixFQUFFLENBQUE7QUFFMUM7SUFBZ0MsOEJBQUk7SUFLaEM7UUFBQSxZQUNJLGlCQUFPLFNBQ1Y7UUFKTyxvQkFBYyxHQUFRLFNBQVMsQ0FBQzs7SUFJeEMsQ0FBQztJQUVELHNCQUFJLDJCQUFHO2FBQVA7WUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUUzQixDQUFDOzs7T0FBQTtJQUVNLHFDQUFnQixHQUF2QjtRQUVJLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFeEIsQ0FBQztJQUdNLG1DQUFjLEdBQXJCO1FBRUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFdkMsQ0FBQztJQUVNLG1DQUFjLEdBQXJCO1FBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7SUFFL0IsQ0FBQztJQUdMLGlCQUFDO0FBQUQsQ0FBQyxBQW5DRCxDQUFnQyxXQUFJLEdBbUNuQztBQW5DWSxnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZpZXcgfSBmcm9tICd1aS9jb3JlL3ZpZXcnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHNcIjtcblxuXG52YXIgYXBwID0gcmVxdWlyZShcImFwcGxpY2F0aW9uXCIpO1xuXG5kZWNsYXJlIHZhciBjb20sIFVJVmlldztcblxuXG4vLyBjb25zdCBWaWRlb1ZpZXc6IGFueSA9IFRWSUNhbWVyYUNhcHR1cmVyXG5jb25zdCB2aWRlb1ZpZXc6IGFueSA9IFRWSUNhbWVyYUNhcHR1cmVyKClcblxuZXhwb3J0IGNsYXNzIExvY2FsVmlkZW8gZXh0ZW5kcyBWaWV3IHtcbiAgICBcbiAgICBuYXRpdmVWaWV3OiBVSVZpZXc7XG4gICAgcHJpdmF0ZSBsb2NhbFZpZGVvVmlldzogYW55ID0gdmlkZW9WaWV3O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgZ2V0IGlvcygpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5hdGl2ZVZpZXc7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlTmF0aXZlVmlldygpIHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBVSVZpZXcubmV3KCk7IFxuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaW5pdE5hdGl2ZVZpZXcoKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5uYXRpdmVWaWV3LmFkZFZpZXcodmlkZW9WaWV3KTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRfbG9jYWxfdmlldygpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsVmlkZW9WaWV3O1xuXG4gICAgfVxuXG5cbn0iXX0=
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("tns-core-modules/ui/core/view");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzREFBcUQ7QUFDckQsb0RBQXNEO0FBU3REO0lBQWdDLDhCQUFJO0lBSWhDO1FBQUEsWUFDSSxpQkFBTyxTQUVWO1FBREcsS0FBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQzs7SUFDM0YsQ0FBQztJQUVELHNCQUFJLCtCQUFPO2FBQVg7WUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUUzQixDQUFDOzs7T0FBQTtJQUVNLHFDQUFnQixHQUF2QjtRQUdJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBRS9CLENBQUM7SUFTTSxzQ0FBaUIsR0FBeEI7UUFFSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUUzQixDQUFDO0lBV0wsaUJBQUM7QUFBRCxDQUFDLEFBNUNELENBQWdDLFdBQUksR0E0Q25DO0FBNUNZLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5cbi8vIHZhciBhcHAgPSByZXF1aXJlKFwiYXBwbGljYXRpb25cIik7XG5cbmRlY2xhcmUgdmFyIGNvbSwgYW5kcm9pZDogYW55O1xuXG4vLyBjb25zdCBWaWRlb1ZpZXc6IGFueSA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9WaWV3O1xuLy8gY29uc3QgdmlkZW9WaWV3ID0gbmV3IFZpZGVvVmlldyh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSk7XG5cbmV4cG9ydCBjbGFzcyBMb2NhbFZpZGVvIGV4dGVuZHMgVmlldyB7XG5cbiAgICBsb2NhbFZpZGVvVmlldzogYW55O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubG9jYWxWaWRlb1ZpZXcgPSBuZXcgY29tLnR3aWxpby52aWRlby5WaWRlb1ZpZXcodXRpbHMuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCkpO1xuICAgIH1cblxuICAgIGdldCBhbmRyb2lkKCk6IGFueSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubmF0aXZlVmlldztcblxuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVOYXRpdmVWaWV3KCkge1xuXG4gICAgICAgIC8vIHJldHVybiBuZXcgYW5kcm9pZC53aWRnZXQuTGluZWFyTGF5b3V0KHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxWaWRlb1ZpZXc7XG5cbiAgICB9XG5cblxuICAgIC8vIHB1YmxpYyBpbml0TmF0aXZlVmlldygpOiB2b2lkIHtcblxuICAgIC8vICAgICAvLyB0aGlzLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLmxvY2FsVmlkZW9WaWV3KTtcblxuICAgIC8vIH1cblxuICAgIHB1YmxpYyBkaXNwb3NlTmF0aXZlVmlldygpIHtcblxuICAgICAgICB0aGlzLm5hdGl2ZVZpZXcgPSBudWxsO1xuXG4gICAgfVxuXG4gICAgLy8gcHVibGljIHJlbW92ZVZpZGVvVmlldygpIHtcblxuICAgIC8vICAgICB0aGlzLm5hdGl2ZVZpZXcucmVtb3ZlVmlldyh0aGlzLmxvY2FsVmlkZW9WaWV3KTtcblxuICAgIC8vIH1cblxuXG5cblxufSJdfQ==
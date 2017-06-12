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
var RemoteVideo = (function (_super) {
    __extends(RemoteVideo, _super);
    function RemoteVideo() {
        var _this = _super.call(this) || this;
        _this.remoteVideoView = videoView;
        return _this;
    }
    Object.defineProperty(RemoteVideo.prototype, "ios", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    RemoteVideo.prototype.createNativeView = function () {
        return UIView.new();
    };
    RemoteVideo.prototype.initNativeView = function () {
        this.nativeView.insertSubviewAtIndex(this.remoteVideoView, 0);
    };
    RemoteVideo.prototype.disposeNativeView = function () {
        this.nativeView = null;
    };
    RemoteVideo.prototype.get_local_view = function () {
        return this.remoteVideoView;
    };
    return RemoteVideo;
}(view_1.View));
exports.RemoteVideo = RemoteVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW1vdGVWaWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFvQztBQUlwQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFHakMsSUFBSSxJQUFJLEdBQUc7SUFDUCxNQUFNLEVBQUU7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO0tBQ1A7SUFDRCxJQUFJLEVBQUU7UUFDRixLQUFLLEVBQUUsQ0FBQztRQUNSLE1BQU0sRUFBRSxDQUFDO0tBQ1o7Q0FDSixDQUFDO0FBR0YsSUFBTSxTQUFTLEdBQVEsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUUvQztJQUFpQywrQkFBSTtJQUtqQztRQUFBLFlBQ0ksaUJBQU8sU0FDVjtRQUpPLHFCQUFlLEdBQVEsU0FBUyxDQUFDOztJQUl6QyxDQUFDO0lBR0Qsc0JBQUksNEJBQUc7YUFBUDtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTNCLENBQUM7OztPQUFBO0lBRU0sc0NBQWdCLEdBQXZCO1FBRUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUV4QixDQUFDO0lBR00sb0NBQWMsR0FBckI7UUFFSSxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFbEUsQ0FBQztJQUVNLHVDQUFpQixHQUF4QjtRQUVJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBRTNCLENBQUM7SUFFTSxvQ0FBYyxHQUFyQjtRQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBRWhDLENBQUM7SUFHTCxrQkFBQztBQUFELENBQUMsQUExQ0QsQ0FBaUMsV0FBSSxHQTBDcEM7QUExQ1ksa0NBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3IH0gZnJvbSAndWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5cblxudmFyIGFwcCA9IHJlcXVpcmUoXCJhcHBsaWNhdGlvblwiKTtcblxuZGVjbGFyZSB2YXIgVFZJVmlkZW9WaWV3O1xubGV0IHJlY3QgPSB7XG4gICAgb3JpZ2luOiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9LFxuICAgIHNpemU6IHtcbiAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgIGhlaWdodDogMFxuICAgIH1cbn07XG5cbi8vIENHUmVjdFxuY29uc3QgdmlkZW9WaWV3OiBhbnkgPSBUVklWaWRlb1ZpZXcuaW5pdChyZWN0KTtcblxuZXhwb3J0IGNsYXNzIFJlbW90ZVZpZGVvIGV4dGVuZHMgVmlldyB7XG5cbiAgICBuYXRpdmVWaWV3OiBVSVZpZXc7XG4gICAgcHJpdmF0ZSByZW1vdGVWaWRlb1ZpZXc6IGFueSA9IHZpZGVvVmlldztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuXG4gICAgZ2V0IGlvcygpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5hdGl2ZVZpZXc7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlTmF0aXZlVmlldygpIHtcblxuICAgICAgICByZXR1cm4gVUlWaWV3Lm5ldygpO1xuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaW5pdE5hdGl2ZVZpZXcoKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5uYXRpdmVWaWV3Lmluc2VydFN1YnZpZXdBdEluZGV4KHRoaXMucmVtb3RlVmlkZW9WaWV3LCAwKTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBkaXNwb3NlTmF0aXZlVmlldygpIHtcblxuICAgICAgICB0aGlzLm5hdGl2ZVZpZXcgPSBudWxsO1xuXG4gICAgfVxuXG4gICAgcHVibGljIGdldF9sb2NhbF92aWV3KCk6IGFueSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3RlVmlkZW9WaWV3O1xuXG4gICAgfVxuXG5cbn0iXX0=
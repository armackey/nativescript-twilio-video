"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var delegates_1 = require("./delegates");
var RemoteVideo = (function (_super) {
    __extends(RemoteVideo, _super);
    function RemoteVideo() {
        var _this = _super.call(this) || this;
        _this._remoteViewDelegate = delegates_1.VideoViewDelegate.initWithOwner(new WeakRef(_this));
        _this.remoteVideoView = TVIVideoView.alloc().initWithFrameDelegate(CGRectMake(0, 0, 0, 0), _this._remoteViewDelegate);
        return _this;
    }
    RemoteVideo.prototype.createNativeView = function () {
        return UIView.new();
    };
    RemoteVideo.prototype.initNativeView = function () {
        this.nativeView.addSubview(this.remoteVideoView);
    };
    RemoteVideo.prototype.disposeNativeView = function () {
        this.nativeView = null;
    };
    Object.defineProperty(RemoteVideo.prototype, "events", {
        get: function () {
            return this._remoteViewDelegate.events;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RemoteVideo.prototype, "ios", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    return RemoteVideo;
}(view_1.View));
exports.RemoteVideo = RemoteVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW1vdGVWaWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFvQztBQUlwQyx5Q0FBZ0Q7QUFLaEQ7SUFBaUMsK0JBQUk7SUFNakM7UUFBQSxZQUNJLGlCQUFPLFNBSVY7UUFGRyxLQUFJLENBQUMsbUJBQW1CLEdBQUcsNkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUUsS0FBSSxDQUFDLGVBQWUsR0FBRyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOztJQUN4SCxDQUFDO0lBRU0sc0NBQWdCLEdBQXZCO1FBRUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUV4QixDQUFDO0lBR00sb0NBQWMsR0FBckI7UUFFSSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFFckQsQ0FBQztJQUVNLHVDQUFpQixHQUF4QjtRQUVJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBRTNCLENBQUM7SUFFRCxzQkFBSSwrQkFBTTthQUFWO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUM7UUFFM0MsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSw0QkFBRzthQUFQO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFM0IsQ0FBQzs7O09BQUE7SUFJTCxrQkFBQztBQUFELENBQUMsQUE5Q0QsQ0FBaUMsV0FBSSxHQThDcEM7QUE5Q1ksa0NBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3IH0gZnJvbSAndWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tT2JqZWN0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGUnO1xuXG5pbXBvcnQgeyBWaWRlb1ZpZXdEZWxlZ2F0ZSB9IGZyb20gJy4vZGVsZWdhdGVzJztcblxuZGVjbGFyZSB2YXIgVFZJVmlkZW9WaWV3LCBDR1JlY3RNYWtlO1xuXG5cbmV4cG9ydCBjbGFzcyBSZW1vdGVWaWRlbyBleHRlbmRzIFZpZXcge1xuXG4gICAgcHVibGljIHJlbW90ZVZpZGVvVmlldzogYW55O1xuICAgIF9yZW1vdGVWaWV3RGVsZWdhdGU6IGFueTtcbiAgICBuYXRpdmVWaWV3OiBVSVZpZXc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLl9yZW1vdGVWaWV3RGVsZWdhdGUgPSBWaWRlb1ZpZXdEZWxlZ2F0ZS5pbml0V2l0aE93bmVyKG5ldyBXZWFrUmVmKHRoaXMpKTtcbiAgICAgICAgdGhpcy5yZW1vdGVWaWRlb1ZpZXcgPSBUVklWaWRlb1ZpZXcuYWxsb2MoKS5pbml0V2l0aEZyYW1lRGVsZWdhdGUoQ0dSZWN0TWFrZSgwLCAwLCAwLCAwKSwgdGhpcy5fcmVtb3RlVmlld0RlbGVnYXRlKTsgICAgICAgICBcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlTmF0aXZlVmlldygpIHtcblxuICAgICAgICByZXR1cm4gVUlWaWV3Lm5ldygpO1xuXG4gICAgfSAgICBcblxuXG4gICAgcHVibGljIGluaXROYXRpdmVWaWV3KCk6IHZvaWQge1xuXG4gICAgICAgIHRoaXMubmF0aXZlVmlldy5hZGRTdWJ2aWV3KHRoaXMucmVtb3RlVmlkZW9WaWV3KTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBkaXNwb3NlTmF0aXZlVmlldygpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLm5hdGl2ZVZpZXcgPSBudWxsO1xuXG4gICAgfVxuXG4gICAgZ2V0IGV2ZW50cygpOiBPYnNlcnZhYmxlIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fcmVtb3RlVmlld0RlbGVnYXRlLmV2ZW50cztcblxuICAgIH1cblxuICAgIGdldCBpb3MoKTogYW55IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5uYXRpdmVWaWV3O1xuXG4gICAgfSAgXG5cblxuXG59Il19
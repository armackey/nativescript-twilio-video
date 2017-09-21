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
        return this.remoteVideoView;
    };
    RemoteVideo.prototype.initNativeView = function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW1vdGVWaWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFvQztBQUlwQyx5Q0FBZ0Q7QUFLaEQ7SUFBaUMsK0JBQUk7SUFNakM7UUFBQSxZQUNJLGlCQUFPLFNBSVY7UUFGRyxLQUFJLENBQUMsbUJBQW1CLEdBQUcsNkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUUsS0FBSSxDQUFDLGVBQWUsR0FBRyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOztJQUN4SCxDQUFDO0lBRU0sc0NBQWdCLEdBQXZCO1FBR0ksTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7SUFFaEMsQ0FBQztJQUdNLG9DQUFjLEdBQXJCO0lBS0EsQ0FBQztJQUVNLHVDQUFpQixHQUF4QjtRQUVJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBRTNCLENBQUM7SUFFRCxzQkFBSSwrQkFBTTthQUFWO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUM7UUFFM0MsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSw0QkFBRzthQUFQO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFM0IsQ0FBQzs7O09BQUE7SUFTTCxrQkFBQztBQUFELENBQUMsQUFyREQsQ0FBaUMsV0FBSSxHQXFEcEM7QUFyRFksa0NBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3IH0gZnJvbSAndWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tT2JqZWN0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGUnO1xuXG5pbXBvcnQgeyBWaWRlb1ZpZXdEZWxlZ2F0ZSB9IGZyb20gJy4vZGVsZWdhdGVzJztcblxuZGVjbGFyZSB2YXIgVFZJVmlkZW9WaWV3LCBDR1JlY3RNYWtlO1xuXG5cbmV4cG9ydCBjbGFzcyBSZW1vdGVWaWRlbyBleHRlbmRzIFZpZXcge1xuXG4gICAgcmVtb3RlVmlkZW9WaWV3OiBhbnk7XG4gICAgX3JlbW90ZVZpZXdEZWxlZ2F0ZTogYW55O1xuICAgIG5hdGl2ZVZpZXc6IFVJVmlldztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuX3JlbW90ZVZpZXdEZWxlZ2F0ZSA9IFZpZGVvVmlld0RlbGVnYXRlLmluaXRXaXRoT3duZXIobmV3IFdlYWtSZWYodGhpcykpO1xuICAgICAgICB0aGlzLnJlbW90ZVZpZGVvVmlldyA9IFRWSVZpZGVvVmlldy5hbGxvYygpLmluaXRXaXRoRnJhbWVEZWxlZ2F0ZShDR1JlY3RNYWtlKDAsIDAsIDAsIDApLCB0aGlzLl9yZW1vdGVWaWV3RGVsZWdhdGUpOyAgICAgICAgIFxuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVOYXRpdmVWaWV3KCkge1xuXG4gICAgICAgIC8vIHJldHVybiBVSVZpZXcubmV3KCk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW90ZVZpZGVvVmlldztcblxuICAgIH0gICAgXG5cblxuICAgIHB1YmxpYyBpbml0TmF0aXZlVmlldygpOiB2b2lkIHtcblxuICAgICAgICAvLyB0aGlzLm5hdGl2ZVZpZXcuYWRkU3Vidmlldyh0aGlzLnJlbW90ZVZpZGVvVmlldyk7XG4gICAgICAgIFxuXG4gICAgfVxuXG4gICAgcHVibGljIGRpc3Bvc2VOYXRpdmVWaWV3KCk6IHZvaWQge1xuXG4gICAgICAgIHRoaXMubmF0aXZlVmlldyA9IG51bGw7XG5cbiAgICB9XG5cbiAgICBnZXQgZXZlbnRzKCk6IE9ic2VydmFibGUge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9yZW1vdGVWaWV3RGVsZWdhdGUuZXZlbnRzO1xuXG4gICAgfVxuXG4gICAgZ2V0IGlvcygpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5hdGl2ZVZpZXc7XG5cbiAgICB9ICBcblxuICAgIC8vIHB1YmxpYyByZW1vdmVWaWRlb1ZpZXcoKSB7XG5cbiAgICAvLyAgICAgdGhpcy5uYXRpdmVWaWV3LnJlbW92ZUZyb21TdXBlcnZpZXcoKTtcbiAgICAgICAgXG4gICAgLy8gfVxuXG5cbn0iXX0=
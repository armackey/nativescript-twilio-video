"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("tns-core-modules/ui/core/view");
var RemoteVideo = (function (_super) {
    __extends(RemoteVideo, _super);
    function RemoteVideo() {
        var _this = _super.call(this) || this;
        _this.remoteVideoView = TVIVideoView.alloc().init();
        _this.remoteVideoView.mirror = true;
        _this.remoteVideoView.contentMode = 2;
        return _this;
    }
    RemoteVideo.prototype.createNativeView = function () {
        return this.remoteVideoView;
    };
    RemoteVideo.prototype.disposeNativeView = function () {
        this.nativeView = null;
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW1vdGVWaWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNEQUFxRDtBQVNyRDtJQUFpQywrQkFBSTtJQU1qQztRQUFBLFlBQ0ksaUJBQU8sU0FNVjtRQUhHLEtBQUksQ0FBQyxlQUFlLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25ELEtBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQyxLQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsSUFBb0MsQ0FBQzs7SUFDekUsQ0FBQztJQUVNLHNDQUFnQixHQUF2QjtRQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBRWhDLENBQUM7SUFFTSx1Q0FBaUIsR0FBeEI7UUFFSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUUzQixDQUFDO0lBR0Qsc0JBQUksNEJBQUc7YUFBUDtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTNCLENBQUM7OztPQUFBO0lBRUwsa0JBQUM7QUFBRCxDQUFDLEFBbENELENBQWlDLFdBQUksR0FrQ3BDO0FBbENZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tT2JqZWN0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGUnO1xuXG4vLyBpbXBvcnQgeyBWaWRlb1ZpZXdEZWxlZ2F0ZSB9IGZyb20gJy4vZGVsZWdhdGVzJztcblxuZGVjbGFyZSB2YXIgVFZJVmlkZW9WaWV3LCBDR1JlY3RNYWtlO1xuXG5cbmV4cG9ydCBjbGFzcyBSZW1vdGVWaWRlbyBleHRlbmRzIFZpZXcge1xuXG4gICAgcmVtb3RlVmlkZW9WaWV3OiBhbnk7XG4gICAgX3JlbW90ZVZpZXdEZWxlZ2F0ZTogYW55O1xuICAgIG5hdGl2ZVZpZXc6IFVJVmlldztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBcbiAgICAgICAgLy8gdGhpcy5fcmVtb3RlVmlld0RlbGVnYXRlID0gVmlkZW9WaWV3RGVsZWdhdGUuaW5pdFdpdGhPd25lcihuZXcgV2Vha1JlZih0aGlzKSk7XG4gICAgICAgIHRoaXMucmVtb3RlVmlkZW9WaWV3ID0gVFZJVmlkZW9WaWV3LmFsbG9jKCkuaW5pdCgpOyBcbiAgICAgICAgdGhpcy5yZW1vdGVWaWRlb1ZpZXcubWlycm9yID0gdHJ1ZTsgICBcbiAgICAgICAgdGhpcy5yZW1vdGVWaWRlb1ZpZXcuY29udGVudE1vZGUgPSBVSVZpZXdDb250ZW50TW9kZS5TY2FsZUFzcGVjdEZpbGw7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZU5hdGl2ZVZpZXcoKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3RlVmlkZW9WaWV3O1xuXG4gICAgfSAgICBcblxuICAgIHB1YmxpYyBkaXNwb3NlTmF0aXZlVmlldygpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLm5hdGl2ZVZpZXcgPSBudWxsO1xuXG4gICAgfVxuXG5cbiAgICBnZXQgaW9zKCk6IGFueSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubmF0aXZlVmlldztcblxuICAgIH0gIFxuXG59Il19
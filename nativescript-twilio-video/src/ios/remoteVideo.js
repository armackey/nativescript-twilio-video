"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW1vdGVWaWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFvQztBQVNwQztJQUFpQywrQkFBSTtJQU1qQztRQUFBLFlBQ0ksaUJBQU8sU0FNVjtRQUhHLEtBQUksQ0FBQyxlQUFlLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25ELEtBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQyxLQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsSUFBb0MsQ0FBQzs7SUFDekUsQ0FBQztJQUVNLHNDQUFnQixHQUF2QjtRQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBRWhDLENBQUM7SUFFTSx1Q0FBaUIsR0FBeEI7UUFFSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUUzQixDQUFDO0lBR0Qsc0JBQUksNEJBQUc7YUFBUDtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTNCLENBQUM7OztPQUFBO0lBRUwsa0JBQUM7QUFBRCxDQUFDLEFBbENELENBQWlDLFdBQUksR0FrQ3BDO0FBbENZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91dGlscy91dGlsc1wiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbU9iamVjdCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZGF0YS9vYnNlcnZhYmxlJztcblxuLy8gaW1wb3J0IHsgVmlkZW9WaWV3RGVsZWdhdGUgfSBmcm9tICcuL2RlbGVnYXRlcyc7XG5cbmRlY2xhcmUgdmFyIFRWSVZpZGVvVmlldywgQ0dSZWN0TWFrZTtcblxuXG5leHBvcnQgY2xhc3MgUmVtb3RlVmlkZW8gZXh0ZW5kcyBWaWV3IHtcblxuICAgIHJlbW90ZVZpZGVvVmlldzogYW55O1xuICAgIF9yZW1vdGVWaWV3RGVsZWdhdGU6IGFueTtcbiAgICBuYXRpdmVWaWV3OiBVSVZpZXc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIHRoaXMuX3JlbW90ZVZpZXdEZWxlZ2F0ZSA9IFZpZGVvVmlld0RlbGVnYXRlLmluaXRXaXRoT3duZXIobmV3IFdlYWtSZWYodGhpcykpO1xuICAgICAgICB0aGlzLnJlbW90ZVZpZGVvVmlldyA9IFRWSVZpZGVvVmlldy5hbGxvYygpLmluaXQoKTsgXG4gICAgICAgIHRoaXMucmVtb3RlVmlkZW9WaWV3Lm1pcnJvciA9IHRydWU7ICAgXG4gICAgICAgIHRoaXMucmVtb3RlVmlkZW9WaWV3LmNvbnRlbnRNb2RlID0gVUlWaWV3Q29udGVudE1vZGUuU2NhbGVBc3BlY3RGaWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVOYXRpdmVWaWV3KCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbW90ZVZpZGVvVmlldztcblxuICAgIH0gICAgXG5cbiAgICBwdWJsaWMgZGlzcG9zZU5hdGl2ZVZpZXcoKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5uYXRpdmVWaWV3ID0gbnVsbDtcblxuICAgIH1cblxuXG4gICAgZ2V0IGlvcygpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5hdGl2ZVZpZXc7XG5cbiAgICB9ICBcblxufSJdfQ==
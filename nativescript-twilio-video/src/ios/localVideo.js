"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
// const videoView = TVIVideoView.alloc().init();
var LocalVideo = (function (_super) {
    __extends(LocalVideo, _super);
    function LocalVideo() {
        var _this = _super.call(this) || this;
        // try {
        //     this._videoViewDelegate = VideoViewDelegate.initWithOwner(new WeakRef(this));
        //     this.localVideoView = TVIVideoView.alloc().init().initWithFrame(this._videoViewDelegate);
        // } catch(e) {
        //     console.log(e);
        // }
        _this.localVideoView = TVIVideoView.alloc().init();
        _this.localVideoView.mirror = true;
        _this.localVideoView.contentMode = 2 /* ScaleAspectFill */;
        return _this;
    }
    LocalVideo.prototype.createNativeView = function () {
        return this.localVideoView;
    };
    LocalVideo.prototype.disposeNativeView = function () {
        this.nativeView = null;
    };
    return LocalVideo;
}(view_1.View));
exports.LocalVideo = LocalVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBb0M7QUFRcEMsaURBQWlEO0FBRWpEO0lBQWdDLDhCQUFJO0lBTWhDO1FBQUEsWUFDSSxpQkFBTyxTQVVWO1FBVEcsUUFBUTtRQUNSLG9GQUFvRjtRQUNwRixnR0FBZ0c7UUFDaEcsZUFBZTtRQUNmLHNCQUFzQjtRQUN0QixJQUFJO1FBQ0osS0FBSSxDQUFDLGNBQWMsR0FBRyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEQsS0FBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2xDLEtBQUksQ0FBQyxjQUFjLENBQUMsV0FBVywwQkFBb0MsQ0FBQzs7SUFDeEUsQ0FBQztJQUVNLHFDQUFnQixHQUF2QjtRQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBRS9CLENBQUM7SUFFTSxzQ0FBaUIsR0FBeEI7UUFFSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUUzQixDQUFDO0lBRUwsaUJBQUM7QUFBRCxDQUFDLEFBL0JELENBQWdDLFdBQUksR0ErQm5DO0FBL0JZLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91dGlscy91dGlsc1wiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbU9iamVjdCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZGF0YS9vYnNlcnZhYmxlJztcblxuaW1wb3J0IHsgVmlkZW9WaWV3RGVsZWdhdGUgfSBmcm9tICcuL2RlbGVnYXRlcyc7XG5cbmRlY2xhcmUgdmFyIFRWSVZpZGVvVmlldztcblxuLy8gY29uc3QgdmlkZW9WaWV3ID0gVFZJVmlkZW9WaWV3LmFsbG9jKCkuaW5pdCgpO1xuXG5leHBvcnQgY2xhc3MgTG9jYWxWaWRlbyBleHRlbmRzIFZpZXcge1xuXG4gICAgbG9jYWxWaWRlb1ZpZXc6IGFueTtcbiAgICBfdmlkZW9WaWV3RGVsZWdhdGU6IGFueTsgXG4gICAgbmF0aXZlVmlldzogYW55O1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICAvLyB0cnkge1xuICAgICAgICAvLyAgICAgdGhpcy5fdmlkZW9WaWV3RGVsZWdhdGUgPSBWaWRlb1ZpZXdEZWxlZ2F0ZS5pbml0V2l0aE93bmVyKG5ldyBXZWFrUmVmKHRoaXMpKTtcbiAgICAgICAgLy8gICAgIHRoaXMubG9jYWxWaWRlb1ZpZXcgPSBUVklWaWRlb1ZpZXcuYWxsb2MoKS5pbml0KCkuaW5pdFdpdGhGcmFtZSh0aGlzLl92aWRlb1ZpZXdEZWxlZ2F0ZSk7XG4gICAgICAgIC8vIH0gY2F0Y2goZSkge1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVmlldyA9IFRWSVZpZGVvVmlldy5hbGxvYygpLmluaXQoKTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVmlldy5taXJyb3IgPSB0cnVlO1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW9WaWV3LmNvbnRlbnRNb2RlID0gVUlWaWV3Q29udGVudE1vZGUuU2NhbGVBc3BlY3RGaWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVOYXRpdmVWaWV3KCk6IGFueSB7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbFZpZGVvVmlldztcblxuICAgIH1cblxuICAgIHB1YmxpYyBkaXNwb3NlTmF0aXZlVmlldygpOiB2b2lkIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubmF0aXZlVmlldyA9IG51bGw7XG5cbiAgICB9XG5cbn1cbiJdfQ==
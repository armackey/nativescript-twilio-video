"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var delegates_1 = require("./delegates");
var LocalVideo = (function (_super) {
    __extends(LocalVideo, _super);
    function LocalVideo() {
        var _this = _super.call(this) || this;
        _this._videoViewDelegate = delegates_1.VideoViewDelegate.initWithOwner(new WeakRef(_this));
        _this.localVideoView = TVIVideoView.alloc().initWithFrameDelegate(CGRectMake(0, 0, 0, 0), _this._videoViewDelegate);
        return _this;
    }
    LocalVideo.prototype.createNativeView = function () {
        return UIView.new();
    };
    LocalVideo.prototype.initNativeView = function () {
        this.nativeView.addSubview(this.localVideoView);
    };
    LocalVideo.prototype.disposeNativeView = function () {
        this.nativeView = null;
    };
    Object.defineProperty(LocalVideo.prototype, "events", {
        get: function () {
            return this._videoViewDelegate.events;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LocalVideo.prototype, "ios", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    return LocalVideo;
}(view_1.View));
exports.LocalVideo = LocalVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBb0M7QUFJcEMseUNBQWdEO0FBS2hEO0lBQWdDLDhCQUFJO0lBTWhDO1FBQUEsWUFDSSxpQkFBTyxTQUtWO1FBSEcsS0FBSSxDQUFDLGtCQUFrQixHQUFHLDZCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdFLEtBQUksQ0FBQyxjQUFjLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7SUFFdEgsQ0FBQztJQUVNLHFDQUFnQixHQUF2QjtRQUVJLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFeEIsQ0FBQztJQUdNLG1DQUFjLEdBQXJCO1FBRUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBRSxDQUFDO0lBRXRELENBQUM7SUFFTSxzQ0FBaUIsR0FBeEI7UUFFSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUUzQixDQUFDO0lBRUQsc0JBQUksOEJBQU07YUFBVjtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDO1FBRTFDLENBQUM7OztPQUFBO0lBRUQsc0JBQUksMkJBQUc7YUFBUDtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTNCLENBQUM7OztPQUFBO0lBWUwsaUJBQUM7QUFBRCxDQUFDLEFBdkRELENBQWdDLFdBQUksR0F1RG5DO0FBdkRZLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91dGlscy91dGlsc1wiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbU9iamVjdCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZGF0YS9vYnNlcnZhYmxlJztcblxuaW1wb3J0IHsgVmlkZW9WaWV3RGVsZWdhdGUgfSBmcm9tICcuL2RlbGVnYXRlcyc7XG5cbmRlY2xhcmUgdmFyIFRWSVZpZGVvVmlldywgQ0dSZWN0TWFrZTtcbi8vIGNvbnN0IHZpZGVvVmlldyA9IFRWSVZpZGVvVmlldy5hbGxvYygpLmluaXQoKTtcblxuZXhwb3J0IGNsYXNzIExvY2FsVmlkZW8gZXh0ZW5kcyBWaWV3IHtcblxuICAgIHB1YmxpYyBsb2NhbFZpZGVvVmlldzogYW55O1xuICAgIHB1YmxpYyBfdmlkZW9WaWV3RGVsZWdhdGU6IGFueTsgXG4gICAgbmF0aXZlVmlldzogVUlWaWV3O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fdmlkZW9WaWV3RGVsZWdhdGUgPSBWaWRlb1ZpZXdEZWxlZ2F0ZS5pbml0V2l0aE93bmVyKG5ldyBXZWFrUmVmKHRoaXMpKTtcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVmlldyA9IFRWSVZpZGVvVmlldy5hbGxvYygpLmluaXRXaXRoRnJhbWVEZWxlZ2F0ZShDR1JlY3RNYWtlKDAsIDAsIDAsIDApLCB0aGlzLl92aWRlb1ZpZXdEZWxlZ2F0ZSk7ICAgIFxuXG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZU5hdGl2ZVZpZXcoKTogYW55IHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBVSVZpZXcubmV3KCk7IFxuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaW5pdE5hdGl2ZVZpZXcoKTogdm9pZCB7ICBcblxuICAgICAgICB0aGlzLm5hdGl2ZVZpZXcuYWRkU3VidmlldyggdGhpcy5sb2NhbFZpZGVvVmlldyApO1xuXG4gICAgfVxuXG4gICAgcHVibGljIGRpc3Bvc2VOYXRpdmVWaWV3KCk6IHZvaWQge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5uYXRpdmVWaWV3ID0gbnVsbDtcblxuICAgIH1cblxuICAgIGdldCBldmVudHMoKTogT2JzZXJ2YWJsZSB7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5fdmlkZW9WaWV3RGVsZWdhdGUuZXZlbnRzO1xuXG4gICAgfVxuXG4gICAgZ2V0IGlvcygpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5hdGl2ZVZpZXc7XG5cbiAgICB9ICAgICAgXG5cbiAgICAvLyBwdWJsaWMgb25Mb2FkZWQoKSB7XG4gICAgLy8gICAgIC8vIGNvbnNvbGUubG9nKGBvbkxvYWRlZCAke3RoaXMud2lkdGh9LCAke3RoaXMuaGVpZ2h0fWApO1xuICAgIC8vICAgICBpZiAodGhpcy53aWR0aCkge1xuICAgIC8vICAgICAgICAgdGhpcy5uYXRpdmVWaWV3LmZyYW1lLnNpemUud2lkdGggPSB0aGlzLndpZHRoO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGlmICh0aGlzLmhlaWdodCkge1xuICAgIC8vICAgICAgICAgdGhpcy5uYXRpdmVWaWV3LmZyYW1lLnNpemUuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG5cbn1cbiJdfQ==
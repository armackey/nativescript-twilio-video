"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
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
var videoView = TVIVideoViewRenderer.alloc().init().view;
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
        this.nativeView.addSubview(videoView);
    };
    return LocalVideo;
}(view_1.View));
exports.LocalVideo = LocalVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBb0M7QUFLcEMsSUFBSSxJQUFJLEdBQUc7SUFDUCxNQUFNLEVBQUU7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO0tBQ1A7SUFDRCxJQUFJLEVBQUU7UUFDRixLQUFLLEVBQUUsQ0FBQztRQUNSLE1BQU0sRUFBRSxDQUFDO0tBQ1o7Q0FDSixDQUFDO0FBR0YsSUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBRTNEO0lBQWdDLDhCQUFJO0lBSWhDO1FBQUEsWUFDSSxpQkFBTyxTQUlWO1FBRkcsS0FBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUM7O0lBRXBDLENBQUM7SUFHRCxzQkFBSSwyQkFBRzthQUFQO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFM0IsQ0FBQzs7O09BQUE7SUFFTSxxQ0FBZ0IsR0FBdkI7UUFFSSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRXhCLENBQUM7SUFHTSxtQ0FBYyxHQUFyQjtRQUlJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFFLFNBQVMsQ0FBRSxDQUFDO0lBRTVDLENBQUM7SUFRTCxpQkFBQztBQUFELENBQUMsQUF2Q0QsQ0FBZ0MsV0FBSSxHQXVDbkM7QUF2Q1ksZ0NBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3IH0gZnJvbSAndWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5cbmRlY2xhcmUgdmFyIFRWSVZpZGVvVmlld1JlbmRlcmVyLCBUVklDYW1lcmFQcmV2aWV3VmlldywgVUlWaWV3Q29udGVudE1vZGVTY2FsZUFzcGVjdEZpdDtcblxubGV0IHJlY3QgPSB7XG4gICAgb3JpZ2luOiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9LFxuICAgIHNpemU6IHtcbiAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgIGhlaWdodDogMFxuICAgIH1cbn07XG5cblxuY29uc3QgdmlkZW9WaWV3ID0gVFZJVmlkZW9WaWV3UmVuZGVyZXIuYWxsb2MoKS5pbml0KCkudmlldztcblxuZXhwb3J0IGNsYXNzIExvY2FsVmlkZW8gZXh0ZW5kcyBWaWV3IHtcbiAgICBcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1ZpZXc6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5sb2NhbFZpZGVvVmlldyA9IHZpZGVvVmlldztcbiAgICAgICAgLy8gY29uc29sZS5sb2codmlkZW9WaWV3KTtcbiAgICB9XG5cbiAgXG4gICAgZ2V0IGlvcygpOiBhbnkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5hdGl2ZVZpZXc7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlTmF0aXZlVmlldygpIHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBVSVZpZXcubmV3KCk7IFxuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaW5pdE5hdGl2ZVZpZXcoKTogdm9pZCB7XG5cbiAgICAgICAgLy8gdGhpcy5uYXRpdmVWaWV3LmNvbnRlbnRNb2RlID0gVUlWaWV3Q29udGVudE1vZGVTY2FsZUFzcGVjdEZpdDtcblxuICAgICAgICB0aGlzLm5hdGl2ZVZpZXcuYWRkU3VidmlldyggdmlkZW9WaWV3ICk7XG5cbiAgICB9XG5cbiAgICAvLyBwdWJsaWMgZGlzcG9zZU5hdGl2ZVZpZXcoKSB7XG4gICAgICAgIFxuICAgIC8vICAgICB0aGlzLm5hdGl2ZVZpZXcgPSBudWxsO1xuXG4gICAgLy8gfSAgXG5cbn0iXX0=
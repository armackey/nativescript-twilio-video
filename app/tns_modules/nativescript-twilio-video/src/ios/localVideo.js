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
var LocalVideo = (function (_super) {
    __extends(LocalVideo, _super);
    function LocalVideo() {
        return _super.call(this) || this;
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
    return LocalVideo;
}(view_1.View));
exports.LocalVideo = LocalVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxWaWRlby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2FsVmlkZW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBb0M7QUFJcEMsSUFBSSxJQUFJLEdBQUc7SUFDUCxNQUFNLEVBQUU7UUFDSixDQUFDLEVBQUUsQ0FBQztRQUNKLENBQUMsRUFBRSxDQUFDO0tBQ1A7SUFDRCxJQUFJLEVBQUU7UUFDRixLQUFLLEVBQUUsQ0FBQztRQUNSLE1BQU0sRUFBRSxDQUFDO0tBQ1o7Q0FDSixDQUFDO0FBR0Y7SUFBZ0MsOEJBQUk7SUFJaEM7ZUFDSSxpQkFBTztJQUdYLENBQUM7SUFHRCxzQkFBSSwyQkFBRzthQUFQO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFM0IsQ0FBQzs7O09BQUE7SUFFTSxxQ0FBZ0IsR0FBdkI7UUFFSSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRXhCLENBQUM7SUFlTCxpQkFBQztBQUFELENBQUMsQUFwQ0QsQ0FBZ0MsV0FBSSxHQW9DbkM7QUFwQ1ksZ0NBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3IH0gZnJvbSAndWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5cblxubGV0IHJlY3QgPSB7XG4gICAgb3JpZ2luOiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9LFxuICAgIHNpemU6IHtcbiAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgIGhlaWdodDogMFxuICAgIH1cbn07XG5cblxuZXhwb3J0IGNsYXNzIExvY2FsVmlkZW8gZXh0ZW5kcyBWaWV3IHtcbiAgICBcbiAgICBwdWJsaWMgbG9jYWxWaWRlb1ZpZXc6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICAvLyB0aGlzLmxvY2FsVmlkZW9WaWV3ID0gVFZJVmlkZW9WaWV3LmluaXQoQ0dSZWN0TWFrZSgwLCAwLCAwLCAwKSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHZpZGVvVmlldyk7XG4gICAgfVxuXG4gIFxuICAgIGdldCBpb3MoKTogYW55IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5uYXRpdmVWaWV3O1xuXG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZU5hdGl2ZVZpZXcoKSB7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gVUlWaWV3Lm5ldygpOyBcblxuICAgIH1cblxuXG4gICAgLy8gcHVibGljIGluaXROYXRpdmVWaWV3KCk6IHZvaWQge1xuXG4gICAgLy8gICAgIHRoaXMubmF0aXZlVmlldy5hZGRTdWJ2aWV3KCB0aGlzLmxvY2FsVmlkZW9WaWV3ICk7XG5cbiAgICAvLyB9XG5cbiAgICAvLyBwdWJsaWMgZGlzcG9zZU5hdGl2ZVZpZXcoKSB7XG4gICAgICAgIFxuICAgIC8vICAgICB0aGlzLm5hdGl2ZVZpZXcgPSBudWxsO1xuXG4gICAgLy8gfSAgXG5cbn0iXX0=
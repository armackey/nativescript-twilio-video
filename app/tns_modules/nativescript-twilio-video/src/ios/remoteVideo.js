"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var RemoteVideo = (function (_super) {
    __extends(RemoteVideo, _super);
    function RemoteVideo() {
        return _super.call(this) || this;
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
    return RemoteVideo;
}(view_1.View));
exports.RemoteVideo = RemoteVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW1vdGVWaWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFvQztBQUtwQztJQUFpQywrQkFBSTtJQUlqQztlQUNJLGlCQUFPO0lBQ1gsQ0FBQztJQUdELHNCQUFJLDRCQUFHO2FBQVA7WUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUUzQixDQUFDOzs7T0FBQTtJQUVNLHNDQUFnQixHQUF2QjtRQUVJLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFeEIsQ0FBQztJQUVMLGtCQUFDO0FBQUQsQ0FBQyxBQXJCRCxDQUFpQyxXQUFJLEdBcUJwQztBQXJCWSxrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZpZXcgfSBmcm9tICd1aS9jb3JlL3ZpZXcnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHNcIjtcblxuXG5cbmV4cG9ydCBjbGFzcyBSZW1vdGVWaWRlbyBleHRlbmRzIFZpZXcge1xuXG4gICAgcHVibGljIGxvY2FsVmlkZW9WaWV3OiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cblxuICAgIGdldCBpb3MoKTogYW55IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5uYXRpdmVWaWV3O1xuXG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZU5hdGl2ZVZpZXcoKSB7XG5cbiAgICAgICAgcmV0dXJuIFVJVmlldy5uZXcoKTtcblxuICAgIH1cblxufSJdfQ==
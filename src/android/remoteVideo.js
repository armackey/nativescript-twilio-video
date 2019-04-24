"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("tns-core-modules/ui/core/view");
var utils = require("tns-core-modules/utils/utils");
var RemoteVideo = (function (_super) {
    __extends(RemoteVideo, _super);
    function RemoteVideo() {
        var _this = _super.call(this) || this;
        _this.remoteVideoView = new com.twilio.video.VideoView(utils.ad.getApplicationContext());
        return _this;
    }
    Object.defineProperty(RemoteVideo.prototype, "android", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    RemoteVideo.prototype.createNativeView = function () {
        return this.remoteVideoView;
    };
    RemoteVideo.prototype.disposeNativeView = function () {
        this.nativeView = null;
    };
    return RemoteVideo;
}(view_1.View));
exports.RemoteVideo = RemoteVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW1vdGVWaWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNEQUFxRDtBQUNyRCxvREFBc0Q7QUFNdEQ7SUFBaUMsK0JBQUk7SUFJakM7UUFBQSxZQUNJLGlCQUFPLFNBR1Y7UUFERyxLQUFJLENBQUMsZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDOztJQUM1RixDQUFDO0lBRUQsc0JBQUksZ0NBQU87YUFBWDtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTNCLENBQUM7OztPQUFBO0lBRU0sc0NBQWdCLEdBQXZCO1FBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7SUFFaEMsQ0FBQztJQUdNLHVDQUFpQixHQUF4QjtRQUVJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBRTNCLENBQUM7SUFHTCxrQkFBQztBQUFELENBQUMsQUE5QkQsQ0FBaUMsV0FBSSxHQThCcEM7QUE5Qlksa0NBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9jb3JlL3ZpZXcnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHNcIjtcblxuZGVjbGFyZSB2YXIgY29tLCBhbmRyb2lkOiBhbnk7XG4vLyBjb25zdCBWaWRlb1ZpZXc6IGFueSA9IGNvbS50d2lsaW8udmlkZW8uVmlkZW9WaWV3O1xuLy8gY29uc3QgdmlkZW9WaWV3ID0gbmV3IFZpZGVvVmlldyh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSk7XG5cbmV4cG9ydCBjbGFzcyBSZW1vdGVWaWRlbyBleHRlbmRzIFZpZXcge1xuXG4gICAgcmVtb3RlVmlkZW9WaWV3OiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnJlbW90ZVZpZGVvVmlldyA9IG5ldyBjb20udHdpbGlvLnZpZGVvLlZpZGVvVmlldyh1dGlscy5hZC5nZXRBcHBsaWNhdGlvbkNvbnRleHQoKSk7XG4gICAgfVxuXG4gICAgZ2V0IGFuZHJvaWQoKTogYW55IHtcblxuICAgICAgICByZXR1cm4gdGhpcy5uYXRpdmVWaWV3O1xuXG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZU5hdGl2ZVZpZXcoKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3RlVmlkZW9WaWV3O1xuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZGlzcG9zZU5hdGl2ZVZpZXcoKSB7XG5cbiAgICAgICAgdGhpcy5uYXRpdmVWaWV3ID0gbnVsbDtcblxuICAgIH1cblxuXG59Il19
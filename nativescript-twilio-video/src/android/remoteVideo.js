"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW1vdGVWaWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFvQztBQUNwQyxvREFBc0Q7QUFNdEQ7SUFBaUMsK0JBQUk7SUFJakM7UUFBQSxZQUNJLGlCQUFPLFNBR1Y7UUFERyxLQUFJLENBQUMsZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDOztJQUM1RixDQUFDO0lBRUQsc0JBQUksZ0NBQU87YUFBWDtZQUVJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTNCLENBQUM7OztPQUFBO0lBRU0sc0NBQWdCLEdBQXZCO1FBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7SUFFaEMsQ0FBQztJQUdNLHVDQUFpQixHQUF4QjtRQUVJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBRTNCLENBQUM7SUFHTCxrQkFBQztBQUFELENBQUMsQUE5QkQsQ0FBaUMsV0FBSSxHQThCcEM7QUE5Qlksa0NBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWaWV3IH0gZnJvbSAndWkvY29yZS92aWV3JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzXCI7XG5cbmRlY2xhcmUgdmFyIGNvbSwgYW5kcm9pZDogYW55O1xuLy8gY29uc3QgVmlkZW9WaWV3OiBhbnkgPSBjb20udHdpbGlvLnZpZGVvLlZpZGVvVmlldztcbi8vIGNvbnN0IHZpZGVvVmlldyA9IG5ldyBWaWRlb1ZpZXcodXRpbHMuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCkpO1xuXG5leHBvcnQgY2xhc3MgUmVtb3RlVmlkZW8gZXh0ZW5kcyBWaWV3IHtcblxuICAgIHJlbW90ZVZpZGVvVmlldzogYW55O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5yZW1vdGVWaWRlb1ZpZXcgPSBuZXcgY29tLnR3aWxpby52aWRlby5WaWRlb1ZpZXcodXRpbHMuYWQuZ2V0QXBwbGljYXRpb25Db250ZXh0KCkpO1xuICAgIH1cblxuICAgIGdldCBhbmRyb2lkKCk6IGFueSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubmF0aXZlVmlldztcblxuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVOYXRpdmVWaWV3KCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbW90ZVZpZGVvVmlldztcblxuICAgIH1cblxuXG4gICAgcHVibGljIGRpc3Bvc2VOYXRpdmVWaWV3KCkge1xuXG4gICAgICAgIHRoaXMubmF0aXZlVmlldyA9IG51bGw7XG5cbiAgICB9XG5cblxufSJdfQ==
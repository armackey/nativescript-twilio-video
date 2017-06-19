"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var utils = require("tns-core-modules/utils/utils");
var VideoView = com.twilio.video.VideoView;
var videoView = new VideoView(utils.ad.getApplicationContext());
var RemoteVideo = (function (_super) {
    __extends(RemoteVideo, _super);
    function RemoteVideo() {
        var _this = _super.call(this) || this;
        _this.remoteVideoView = videoView;
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
        return new android.widget.LinearLayout(utils.ad.getApplicationContext());
    };
    RemoteVideo.prototype.initNativeView = function () {
        this.nativeView.addView(videoView);
    };
    RemoteVideo.prototype.get_remote_view = function () {
        return this.remoteVideoView;
    };
    return RemoteVideo;
}(view_1.View));
exports.RemoteVideo = RemoteVideo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW1vdGVWaWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFvQztBQUNwQyxvREFBc0Q7QUFHdEQsSUFBTSxTQUFTLEdBQVEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO0FBQ2xELElBQU0sU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO0FBRWxFO0lBQWlDLCtCQUFJO0lBSWpDO1FBQUEsWUFDSSxpQkFBTyxTQUNWO1FBSk8scUJBQWUsR0FBUSxTQUFTLENBQUM7O0lBSXpDLENBQUM7SUFFRCxzQkFBSSxnQ0FBTzthQUFYO1lBRUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFM0IsQ0FBQzs7O09BQUE7SUFFTSxzQ0FBZ0IsR0FBdkI7UUFFSSxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztJQUU3RSxDQUFDO0lBR00sb0NBQWMsR0FBckI7UUFFSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV2QyxDQUFDO0lBSU0scUNBQWUsR0FBdEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBR0wsa0JBQUM7QUFBRCxDQUFDLEFBbENELENBQWlDLFdBQUksR0FrQ3BDO0FBbENZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlldyB9IGZyb20gJ3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91dGlscy91dGlsc1wiO1xuXG5kZWNsYXJlIHZhciBjb20sIGFuZHJvaWQ6IGFueTtcbmNvbnN0IFZpZGVvVmlldzogYW55ID0gY29tLnR3aWxpby52aWRlby5WaWRlb1ZpZXc7XG5jb25zdCB2aWRlb1ZpZXcgPSBuZXcgVmlkZW9WaWV3KHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpKTtcblxuZXhwb3J0IGNsYXNzIFJlbW90ZVZpZGVvIGV4dGVuZHMgVmlldyB7XG5cbiAgICBwcml2YXRlIHJlbW90ZVZpZGVvVmlldzogYW55ID0gdmlkZW9WaWV3O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuICAgIFxuICAgIGdldCBhbmRyb2lkKCk6IGFueSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubmF0aXZlVmlldztcblxuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVOYXRpdmVWaWV3KCkge1xuXG4gICAgICAgIHJldHVybiBuZXcgYW5kcm9pZC53aWRnZXQuTGluZWFyTGF5b3V0KHV0aWxzLmFkLmdldEFwcGxpY2F0aW9uQ29udGV4dCgpKTtcblxuICAgIH1cblxuXG4gICAgcHVibGljIGluaXROYXRpdmVWaWV3KCk6IHZvaWQge1xuXG4gICAgICAgIHRoaXMubmF0aXZlVmlldy5hZGRWaWV3KHZpZGVvVmlldyk7XG5cbiAgICB9ICBcblxuXG5cbiAgICBwdWJsaWMgZ2V0X3JlbW90ZV92aWV3KCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW90ZVZpZGVvVmlldztcbiAgICB9XG5cblxufSJdfQ==
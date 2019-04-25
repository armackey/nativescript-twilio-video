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
//# sourceMappingURL=remoteVideo.js.map
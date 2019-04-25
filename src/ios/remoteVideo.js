"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("tns-core-modules/ui/core/view");
var RemoteVideo = (function (_super) {
    __extends(RemoteVideo, _super);
    function RemoteVideo() {
        var _this = _super.call(this) || this;
        _this.remoteVideoView = TVIVideoView.alloc().init();
        _this.remoteVideoView.mirror = true;
        _this.remoteVideoView.contentMode = UIViewContentMode.ScaleAspectFill;
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
//# sourceMappingURL=remoteVideo.js.map
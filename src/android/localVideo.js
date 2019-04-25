"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("tns-core-modules/ui/core/view");
var utils = require("tns-core-modules/utils/utils");
var LocalVideo = (function (_super) {
    __extends(LocalVideo, _super);
    function LocalVideo() {
        var _this = _super.call(this) || this;
        _this.localVideoView = new com.twilio.video.VideoView(utils.ad.getApplicationContext());
        return _this;
    }
    Object.defineProperty(LocalVideo.prototype, "android", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    LocalVideo.prototype.createNativeView = function () {
        return this.localVideoView;
    };
    LocalVideo.prototype.disposeNativeView = function () {
        this.nativeView = null;
    };
    return LocalVideo;
}(view_1.View));
exports.LocalVideo = LocalVideo;
//# sourceMappingURL=localVideo.js.map
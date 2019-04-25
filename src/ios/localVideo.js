"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("tns-core-modules/ui/core/view");
var LocalVideo = (function (_super) {
    __extends(LocalVideo, _super);
    function LocalVideo() {
        var _this = _super.call(this) || this;
        _this.localVideoView = TVIVideoView.alloc().init();
        _this.localVideoView.mirror = true;
        _this.localVideoView.contentMode = UIViewContentMode.ScaleAspectFill;
        return _this;
    }
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
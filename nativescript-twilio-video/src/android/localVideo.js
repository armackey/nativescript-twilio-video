"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var view_1 = require("ui/core/view");
var utils = require("tns-core-modules/utils/utils");
// const VideoView: any = com.twilio.video.VideoView;
// const videoView = new VideoView(utils.ad.getApplicationContext());
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
        // return new android.widget.LinearLayout(utils.ad.getApplicationContext());
        return this.localVideoView;
    };
    // public initNativeView(): void {
    //     // this.nativeView.addView(this.localVideoView);
    // }
    LocalVideo.prototype.disposeNativeView = function () {
        this.nativeView = null;
    };
    return LocalVideo;
}(view_1.View));
exports.LocalVideo = LocalVideo;

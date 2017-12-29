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

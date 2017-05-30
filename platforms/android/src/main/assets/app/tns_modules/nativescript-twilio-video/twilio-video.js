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
var AudioManager = android.media.AudioManager;
var LocalParticipant = com.twilio.video.LocalParticipant;
var RoomState = com.twilio.video.RoomState;
var Video = com.twilio.video.Video;
var VideoRenderer = com.twilio.video.VideoRenderer;
var TwilioException = com.twilio.video.TwilioException;
// const quickstart.R = com.twilio.video.quickstart.R;
// const quickstart.dialog.Dialog = com.twilio.video.quickstart.dialog.Dialog;
var AudioTrack = com.twilio.video.AudioTrack;
var CameraCapturer = com.twilio.video.CameraCapturer;
// const CameraCapturer.CameraSource = com.twilio.video.CameraCapturer.CameraSource;
var ConnectOptions = com.twilio.video.ConnectOptions;
var LocalAudioTrack = com.twilio.video.LocalAudioTrack;
var LocalVideoTrack = com.twilio.video.LocalVideoTrack;
var Participant = com.twilio.video.Participant;
var Room = com.twilio.video.Room;
var VideoTrack = com.twilio.video.VideoTrack;
var VideoView = com.twilio.video.VideoView;
var VideoActivity = (function (_super) {
    __extends(VideoActivity, _super);
    function VideoActivity() {
        return _super.call(this) || this;
    }
    Object.defineProperty(VideoActivity.prototype, "android", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    VideoActivity.prototype.createNativeView = function () {
        return new VideoView(this._context, null);
    };
    return VideoActivity;
}(view_1.View));
exports.VideoActivity = VideoActivity;

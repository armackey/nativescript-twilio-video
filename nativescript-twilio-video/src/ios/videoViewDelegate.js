"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("tns-core-modules/data/observable");
var VideoViewDelegate = (function (_super) {
    __extends(VideoViewDelegate, _super);
    function VideoViewDelegate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VideoViewDelegate.initWithOwner = function (owner) {
        var videoViewDelegate = new VideoViewDelegate();
        videoViewDelegate._events = new observable_1.Observable();
        videoViewDelegate._owner = owner;
        return videoViewDelegate;
    };
    VideoViewDelegate.prototype.videoViewDidReceiveData = function (view) {
        console.log('videoViewDidReceiveData');
        if (this._events) {
            this._events.notify({
                eventName: 'videoViewDidReceiveData',
                object: observable_1.fromObject({
                    view: view,
                })
            });
        }
    };
    VideoViewDelegate.prototype.videoViewVideoDimensionsDidChange = function (view, dimensions) {
        console.log('videoDimensionsDidChange');
        if (this._events) {
            this._events.notify({
                eventName: 'videoDimensionsDidChange',
                object: observable_1.fromObject({
                    view: view,
                    dimensions: dimensions
                })
            });
        }
    };
    VideoViewDelegate.prototype.videoViewVideoOrientationDidChange = function (view, orientation) {
        console.log('videoViewVideoOrientationDidChange');
        if (this._events) {
            this._events.notify({
                eventName: 'videoViewVideoOrientationDidChange',
                object: observable_1.fromObject({
                    view: view,
                    orientation: orientation
                })
            });
        }
    };
    return VideoViewDelegate;
}(NSObject));
VideoViewDelegate.ObjCProtocols = [TVIVideoViewDelegate];
exports.VideoViewDelegate = VideoViewDelegate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW9WaWV3RGVsZWdhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ2aWRlb1ZpZXdEZWxlZ2F0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQUEwRTtBQUkxRTtJQUF1QyxxQ0FBUTtJQUEvQzs7SUEyREEsQ0FBQztJQW5EaUIsK0JBQWEsR0FBM0IsVUFBNEIsS0FBbUI7UUFFM0MsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFFaEQsaUJBQWlCLENBQUMsT0FBTyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBRTdDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFakMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0lBRTdCLENBQUM7SUFHTSxtREFBdUIsR0FBOUIsVUFBK0IsSUFBUztRQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDdkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztnQkFDaEIsU0FBUyxFQUFFLHlCQUF5QjtnQkFDcEMsTUFBTSxFQUFFLHVCQUFVLENBQUM7b0JBQ2YsSUFBSSxFQUFFLElBQUk7aUJBQ2IsQ0FBQzthQUNMLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0lBRU0sNkRBQWlDLEdBQXhDLFVBQXlDLElBQVMsRUFBRSxVQUFlO1FBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN4QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUNoQixTQUFTLEVBQUUsMEJBQTBCO2dCQUNyQyxNQUFNLEVBQUUsdUJBQVUsQ0FBQztvQkFDZixJQUFJLEVBQUUsSUFBSTtvQkFDVixVQUFVLEVBQUUsVUFBVTtpQkFDekIsQ0FBQzthQUNMLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0lBRU0sOERBQWtDLEdBQXpDLFVBQTBDLElBQVMsRUFBRSxXQUFnQjtRQUNqRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDbEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztnQkFDaEIsU0FBUyxFQUFFLG9DQUFvQztnQkFDL0MsTUFBTSxFQUFFLHVCQUFVLENBQUM7b0JBQ2YsSUFBSSxFQUFFLElBQUk7b0JBQ1YsV0FBVyxFQUFFLFdBQVc7aUJBQzNCLENBQUM7YUFDTCxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztJQUVMLHdCQUFDO0FBQUQsQ0FBQyxBQTNERCxDQUF1QyxRQUFRO0FBRTdCLCtCQUFhLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBRjVDLDhDQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUsIGZyb21PYmplY3QgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2RhdGEvb2JzZXJ2YWJsZSc7XG5cbmRlY2xhcmUgdmFyIFRWSVZpZGVvVmlld0RlbGVnYXRlO1xuXG5leHBvcnQgY2xhc3MgVmlkZW9WaWV3RGVsZWdhdGUgZXh0ZW5kcyBOU09iamVjdCB7XG5cbiAgICBwdWJsaWMgc3RhdGljIE9iakNQcm90b2NvbHMgPSBbVFZJVmlkZW9WaWV3RGVsZWdhdGVdO1xuXG4gICAgcHJpdmF0ZSBfZXZlbnRzOiBPYnNlcnZhYmxlO1xuXG4gICAgcHJpdmF0ZSBfb3duZXI6IFdlYWtSZWY8YW55PjtcblxuICAgIHB1YmxpYyBzdGF0aWMgaW5pdFdpdGhPd25lcihvd25lcjogV2Vha1JlZjxhbnk+KTogVmlkZW9WaWV3RGVsZWdhdGUge1xuXG4gICAgICAgIGxldCB2aWRlb1ZpZXdEZWxlZ2F0ZSA9IG5ldyBWaWRlb1ZpZXdEZWxlZ2F0ZSgpO1xuXG4gICAgICAgIHZpZGVvVmlld0RlbGVnYXRlLl9ldmVudHMgPSBuZXcgT2JzZXJ2YWJsZSgpO1xuXG4gICAgICAgIHZpZGVvVmlld0RlbGVnYXRlLl9vd25lciA9IG93bmVyO1xuXG4gICAgICAgIHJldHVybiB2aWRlb1ZpZXdEZWxlZ2F0ZTtcblxuICAgIH1cblxuXG4gICAgcHVibGljIHZpZGVvVmlld0RpZFJlY2VpdmVEYXRhKHZpZXc6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZygndmlkZW9WaWV3RGlkUmVjZWl2ZURhdGEnKTtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgZXZlbnROYW1lOiAndmlkZW9WaWV3RGlkUmVjZWl2ZURhdGEnLFxuICAgICAgICAgICAgICAgIG9iamVjdDogZnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIHZpZXc6IHZpZXcsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHZpZGVvVmlld1ZpZGVvRGltZW5zaW9uc0RpZENoYW5nZSh2aWV3OiBhbnksIGRpbWVuc2lvbnM6IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZygndmlkZW9EaW1lbnNpb25zRGlkQ2hhbmdlJyk7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cy5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogJ3ZpZGVvRGltZW5zaW9uc0RpZENoYW5nZScsXG4gICAgICAgICAgICAgICAgb2JqZWN0OiBmcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgdmlldzogdmlldyxcbiAgICAgICAgICAgICAgICAgICAgZGltZW5zaW9uczogZGltZW5zaW9uc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyB2aWRlb1ZpZXdWaWRlb09yaWVudGF0aW9uRGlkQ2hhbmdlKHZpZXc6IGFueSwgb3JpZW50YXRpb246IGFueSkge1xuICAgICAgICBjb25zb2xlLmxvZygndmlkZW9WaWV3VmlkZW9PcmllbnRhdGlvbkRpZENoYW5nZScpO1xuICAgICAgICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBldmVudE5hbWU6ICd2aWRlb1ZpZXdWaWRlb09yaWVudGF0aW9uRGlkQ2hhbmdlJyxcbiAgICAgICAgICAgICAgICBvYmplY3Q6IGZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICB2aWV3OiB2aWV3LFxuICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogb3JpZW50YXRpb25cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0iXX0=
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("data/observable");
var nativescript_twilio_video_1 = require("nativescript-twilio-video");
var permissions = require('nativescript-permissions');
var HelloWorldModel = (function (_super) {
    __extends(HelloWorldModel, _super);
    function HelloWorldModel(page) {
        var _this = _super.call(this) || this;
        _this.page = page;
        _this.getPermissions();
        _this.renderView();
        return _this;
    }
    HelloWorldModel.prototype.renderView = function () {
        console.log('renderView called');
        var videoActivity = new nativescript_twilio_video_1.VideoActivity();
        this.localVideo = this.page.getViewById('local-video');
        console.dir(videoActivity.createAudioAndVideoTracks(this.localVideo));
    };
    HelloWorldModel.prototype.getPermissions = function () {
        var self = this;
        permissions.requestPermissions([android.Manifest.permission.RECORD_AUDIO,
            android.Manifest.permission.CAMERA], "I need these permissions because I'm cool")
            .then(function () {
            console.log("Woo Hoo, I have the power!");
        })
            .catch(function (e) {
            console.dir(e);
            console.log("Uh oh, no permissions - plan B time!");
        });
    };
    Object.defineProperty(HelloWorldModel.prototype, "message", {
        get: function () {
            return this._message;
        },
        set: function (value) {
            if (this._message !== value) {
                this._message = value;
                this.notifyPropertyChange('message', value);
            }
        },
        enumerable: true,
        configurable: true
    });
    HelloWorldModel.prototype.onTap = function () {
        this._counter--;
        this.updateMessage();
    };
    HelloWorldModel.prototype.updateMessage = function () {
        if (this._counter <= 0) {
            this.message = 'Hoorraaay! You unlocked the NativeScript clicker achievement!';
        }
        else {
            this.message = this._counter + " taps left";
        }
    };
    return HelloWorldModel;
}(observable_1.Observable));
exports.HelloWorldModel = HelloWorldModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi12aWV3LW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFpbi12aWV3LW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQTJDO0FBQzNDLHVFQUEwRDtBQUkxRCxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUV0RDtJQUFxQyxtQ0FBVTtJQU0zQyx5QkFBb0IsSUFBVTtRQUE5QixZQUNJLGlCQUFPLFNBYVY7UUFkbUIsVUFBSSxHQUFKLElBQUksQ0FBTTtRQVUxQixLQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFHdEIsS0FBSSxDQUFDLFVBQVUsRUFBRSxDQUFBOztJQUNyQixDQUFDO0lBRUQsb0NBQVUsR0FBVjtRQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNqQyxJQUFJLGFBQWEsR0FBRyxJQUFJLHlDQUFhLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCx3Q0FBYyxHQUFkO1FBRUksSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWxCLFdBQVcsQ0FBQyxrQkFBa0IsQ0FDMUIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZO1lBQ3pDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLDJDQUEyQyxDQUFDO2FBQ2hGLElBQUksQ0FBQztZQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUk5QyxDQUFDLENBQUM7YUFDRCxLQUFLLENBQUMsVUFBVSxDQUFDO1lBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0NBQXNDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxzQkFBSSxvQ0FBTzthQUFYO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQzthQUVELFVBQVksS0FBYTtZQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUN0QixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFBO1lBQy9DLENBQUM7UUFDTCxDQUFDOzs7T0FQQTtJQVNNLCtCQUFLLEdBQVo7UUFDSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFTyx1Q0FBYSxHQUFyQjtRQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLCtEQUErRCxDQUFDO1FBQ25GLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxPQUFPLEdBQU0sSUFBSSxDQUFDLFFBQVEsZUFBWSxDQUFDO1FBQ2hELENBQUM7SUFDTCxDQUFDO0lBQ0wsc0JBQUM7QUFBRCxDQUFDLEFBeEVELENBQXFDLHVCQUFVLEdBd0U5QztBQXhFWSwwQ0FBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnZGF0YS9vYnNlcnZhYmxlJztcbmltcG9ydCB7IFZpZGVvQWN0aXZpdHkgfSBmcm9tICduYXRpdmVzY3JpcHQtdHdpbGlvLXZpZGVvJztcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd1aS9wYWdlJztcbmltcG9ydCAqIGFzIGFwcCBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvblwiO1xuXG52YXIgcGVybWlzc2lvbnMgPSByZXF1aXJlKCduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnKTtcblxuZXhwb3J0IGNsYXNzIEhlbGxvV29ybGRNb2RlbCBleHRlbmRzIE9ic2VydmFibGUge1xuXG4gICAgcHJpdmF0ZSBfY291bnRlcjogbnVtYmVyO1xuICAgIHByaXZhdGUgX21lc3NhZ2U6IHN0cmluZztcbiAgICBwcml2YXRlIGxvY2FsVmlkZW86IGFueTtcbiAgICAvLyBwcml2YXRlIHNlbGY6IGFueTtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhZ2U6IFBhZ2UpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvLyBsZXQgdmlkZW9BY3Rpdml0eSA9IG5ldyBWaWRlb0FjdGl2aXR5KCk7XG4gICAgICAgIC8vIHRoaXMubG9jYWxWaWRlbyA9IHRoaXMucGFnZS5nZXRWaWV3QnlJZCgnbG9jYWwtdmlkZW8nKTtcblxuXG4gICAgICAgIC8vIHZpZGVvQWN0aXZpdHkuY3JlYXRlQXVkaW9BbmRWaWRlb1RyYWNrcyh0aGlzLmxvY2FsVmlkZW8pOyBcbiAgICAgICAgLy8gdGhpcy5yZW5kZXJWaWV3KCk7XG5cbiAgICAgICAgdGhpcy5nZXRQZXJtaXNzaW9ucygpO1xuXG5cbiAgICAgICAgdGhpcy5yZW5kZXJWaWV3KClcbiAgICB9XG5cbiAgICByZW5kZXJWaWV3KCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygncmVuZGVyVmlldyBjYWxsZWQnKTtcbiAgICAgICAgbGV0IHZpZGVvQWN0aXZpdHkgPSBuZXcgVmlkZW9BY3Rpdml0eSgpO1xuICAgICAgICB0aGlzLmxvY2FsVmlkZW8gPSB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoJ2xvY2FsLXZpZGVvJyk7XG4gICAgICAgIGNvbnNvbGUuZGlyKHZpZGVvQWN0aXZpdHkuY3JlYXRlQXVkaW9BbmRWaWRlb1RyYWNrcyh0aGlzLmxvY2FsVmlkZW8pKTsgXG4gICAgfVxuXG4gICAgZ2V0UGVybWlzc2lvbnMoKTogdm9pZCB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgICBwZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbnMoXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQ09SRF9BVURJTyxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5DQU1FUkFdLCBcIkkgbmVlZCB0aGVzZSBwZXJtaXNzaW9ucyBiZWNhdXNlIEknbSBjb29sXCIpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIldvbyBIb28sIEkgaGF2ZSB0aGUgcG93ZXIhXCIpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNlbGYucmVuZGVyVmlldygpKTtcbiAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGlyKGUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVWggb2gsIG5vIHBlcm1pc3Npb25zIC0gcGxhbiBCIHRpbWUhXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IG1lc3NhZ2UoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2U7XG4gICAgfVxuICAgIFxuICAgIHNldCBtZXNzYWdlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuX21lc3NhZ2UgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeVByb3BlcnR5Q2hhbmdlKCdtZXNzYWdlJywgdmFsdWUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb25UYXAoKSB7XG4gICAgICAgIHRoaXMuX2NvdW50ZXItLTtcbiAgICAgICAgdGhpcy51cGRhdGVNZXNzYWdlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVNZXNzYWdlKCkge1xuICAgICAgICBpZiAodGhpcy5fY291bnRlciA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UgPSAnSG9vcnJhYWF5ISBZb3UgdW5sb2NrZWQgdGhlIE5hdGl2ZVNjcmlwdCBjbGlja2VyIGFjaGlldmVtZW50ISc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UgPSBgJHt0aGlzLl9jb3VudGVyfSB0YXBzIGxlZnRgO1xuICAgICAgICB9XG4gICAgfVxufSJdfQ==
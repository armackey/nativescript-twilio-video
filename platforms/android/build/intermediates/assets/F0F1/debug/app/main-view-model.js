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
        videoActivity.createAudioAndVideoTracks(this.localVideo);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi12aWV3LW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFpbi12aWV3LW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQTJDO0FBQzNDLHVFQUEwRDtBQUkxRCxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUV0RDtJQUFxQyxtQ0FBVTtJQU0zQyx5QkFBb0IsSUFBVTtRQUE5QixZQUNJLGlCQUFPLFNBYVY7UUFkbUIsVUFBSSxHQUFKLElBQUksQ0FBTTtRQVUxQixLQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFHdEIsS0FBSSxDQUFDLFVBQVUsRUFBRSxDQUFBOztJQUNyQixDQUFDO0lBRUQsb0NBQVUsR0FBVjtRQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNqQyxJQUFJLGFBQWEsR0FBRyxJQUFJLHlDQUFhLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELHdDQUFjLEdBQWQ7UUFFSSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUM7UUFFbEIsV0FBVyxDQUFDLGtCQUFrQixDQUMxQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVk7WUFDekMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsMkNBQTJDLENBQUM7YUFDaEYsSUFBSSxDQUFDO1lBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBSTlDLENBQUMsQ0FBQzthQUNELEtBQUssQ0FBQyxVQUFVLENBQUM7WUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELHNCQUFJLG9DQUFPO2FBQVg7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDO2FBRUQsVUFBWSxLQUFhO1lBQ3JCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDL0MsQ0FBQztRQUNMLENBQUM7OztPQVBBO0lBU00sK0JBQUssR0FBWjtRQUNJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVPLHVDQUFhLEdBQXJCO1FBQ0ksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsK0RBQStELENBQUM7UUFDbkYsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLE9BQU8sR0FBTSxJQUFJLENBQUMsUUFBUSxlQUFZLENBQUM7UUFDaEQsQ0FBQztJQUNMLENBQUM7SUFDTCxzQkFBQztBQUFELENBQUMsQUF4RUQsQ0FBcUMsdUJBQVUsR0F3RTlDO0FBeEVZLDBDQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdkYXRhL29ic2VydmFibGUnO1xuaW1wb3J0IHsgVmlkZW9BY3Rpdml0eSB9IGZyb20gJ25hdGl2ZXNjcmlwdC10d2lsaW8tdmlkZW8nO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gJ3VpL3BhZ2UnO1xuaW1wb3J0ICogYXMgYXBwIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uXCI7XG5cbnZhciBwZXJtaXNzaW9ucyA9IHJlcXVpcmUoJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucycpO1xuXG5leHBvcnQgY2xhc3MgSGVsbG9Xb3JsZE1vZGVsIGV4dGVuZHMgT2JzZXJ2YWJsZSB7XG5cbiAgICBwcml2YXRlIF9jb3VudGVyOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfbWVzc2FnZTogc3RyaW5nO1xuICAgIHByaXZhdGUgbG9jYWxWaWRlbzogYW55O1xuICAgIC8vIHByaXZhdGUgc2VsZjogYW55O1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFnZTogUGFnZSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8vIGxldCB2aWRlb0FjdGl2aXR5ID0gbmV3IFZpZGVvQWN0aXZpdHkoKTtcbiAgICAgICAgLy8gdGhpcy5sb2NhbFZpZGVvID0gdGhpcy5wYWdlLmdldFZpZXdCeUlkKCdsb2NhbC12aWRlbycpO1xuXG5cbiAgICAgICAgLy8gdmlkZW9BY3Rpdml0eS5jcmVhdGVBdWRpb0FuZFZpZGVvVHJhY2tzKHRoaXMubG9jYWxWaWRlbyk7IFxuICAgICAgICAvLyB0aGlzLnJlbmRlclZpZXcoKTtcblxuICAgICAgICB0aGlzLmdldFBlcm1pc3Npb25zKCk7XG5cblxuICAgICAgICB0aGlzLnJlbmRlclZpZXcoKVxuICAgIH1cblxuICAgIHJlbmRlclZpZXcoKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdyZW5kZXJWaWV3IGNhbGxlZCcpO1xuICAgICAgICBsZXQgdmlkZW9BY3Rpdml0eSA9IG5ldyBWaWRlb0FjdGl2aXR5KCk7XG4gICAgICAgIHRoaXMubG9jYWxWaWRlbyA9IHRoaXMucGFnZS5nZXRWaWV3QnlJZCgnbG9jYWwtdmlkZW8nKTtcbiAgICAgICAgdmlkZW9BY3Rpdml0eS5jcmVhdGVBdWRpb0FuZFZpZGVvVHJhY2tzKHRoaXMubG9jYWxWaWRlbyk7IFxuICAgIH1cblxuICAgIGdldFBlcm1pc3Npb25zKCk6IHZvaWQge1xuICAgICAgICBcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb25zKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUNPUkRfQVVESU8sXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uQ0FNRVJBXSwgXCJJIG5lZWQgdGhlc2UgcGVybWlzc2lvbnMgYmVjYXVzZSBJJ20gY29vbFwiKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJXb28gSG9vLCBJIGhhdmUgdGhlIHBvd2VyIVwiKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzZWxmLnJlbmRlclZpZXcoKSk7XG4gICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRpcihlKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVoIG9oLCBubyBwZXJtaXNzaW9ucyAtIHBsYW4gQiB0aW1lIVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBtZXNzYWdlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbWVzc2FnZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLl9tZXNzYWdlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlQcm9wZXJ0eUNoYW5nZSgnbWVzc2FnZScsIHZhbHVlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG9uVGFwKCkge1xuICAgICAgICB0aGlzLl9jb3VudGVyLS07XG4gICAgICAgIHRoaXMudXBkYXRlTWVzc2FnZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlTWVzc2FnZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvdW50ZXIgPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlID0gJ0hvb3JyYWFheSEgWW91IHVubG9ja2VkIHRoZSBOYXRpdmVTY3JpcHQgY2xpY2tlciBhY2hpZXZlbWVudCEnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlID0gYCR7dGhpcy5fY291bnRlcn0gdGFwcyBsZWZ0YDtcbiAgICAgICAgfVxuICAgIH1cbn0iXX0=
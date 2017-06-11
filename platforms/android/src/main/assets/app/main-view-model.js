"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("data/observable");
var http = require("http");
var nativescript_twilio_video_1 = require("nativescript-twilio-video");
var timer = require("timer");
var permissions = require('nativescript-permissions');
var HelloWorldModel = (function (_super) {
    __extends(HelloWorldModel, _super);
    function HelloWorldModel(page) {
        var _this = _super.call(this) || this;
        _this.page = page;
        _this.videoActivity = new nativescript_twilio_video_1.VideoActivity();
        _this.getPermissions();
        console.dir(_this.videoActivity);
        _this.on('onConnected', function (data) {
            console.log('working');
            console.log(data);
        });
        return _this;
    }
    HelloWorldModel.prototype.getPermissions = function () {
        permissions.requestPermissions([
            android.Manifest.permission.RECORD_AUDIO,
            android.Manifest.permission.CAMERA
        ], "I need these permissions because I'm cool")
            .then(function (response) {
        })
            .catch(function (e) {
            console.dir(e);
            console.log("Uh oh, no permissions - plan B time!");
        });
    };
    HelloWorldModel.prototype.show_local_video = function () {
        this.videoActivity.createAudioAndVideoTracks();
    };
    HelloWorldModel.prototype.toggle_local_video = function () {
        this.videoActivity.toggle_local_video();
    };
    HelloWorldModel.prototype.set_access_token = function (token, name) {
        this.videoActivity.set_access_token(token, name);
    };
    HelloWorldModel.prototype.connect_to_room = function (room) {
        var _this = this;
        http.getJSON('http://ac865ff2.ngrok.io/token').then(function (res) {
            _this.set('name', res.identity);
            _this.set_access_token(res.token, res.identity);
            _this.videoActivity.connect_to_room('change3');
            console.log('hit');
        }, function (e) {
            console.log(e);
        });
    };
    return HelloWorldModel;
}(observable_1.Observable));
exports.HelloWorldModel = HelloWorldModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi12aWV3LW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFpbi12aWV3LW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQTJDO0FBRzNDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUUzQix1RUFBbUY7QUFJbkYsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBS3REO0lBQXFDLG1DQUFVO0lBUzNDLHlCQUFvQixJQUFVO1FBQTlCLFlBQ0ksaUJBQU8sU0FZVjtRQWJtQixVQUFJLEdBQUosSUFBSSxDQUFNO1FBRTFCLEtBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSx5Q0FBYSxFQUFFLENBQUM7UUFDekMsS0FBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXRCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hDLEtBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQUMsSUFBSTtZQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUE7O0lBSU4sQ0FBQztJQUlELHdDQUFjLEdBQWQ7UUFFSSxXQUFXLENBQUMsa0JBQWtCLENBQUM7WUFDM0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWTtZQUN4QyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNO1NBQ2pDLEVBQUUsMkNBQTJDLENBQUM7YUFDOUMsSUFBSSxDQUFDLFVBQUMsUUFBUTtRQUNmLENBQUMsQ0FBQzthQUNELEtBQUssQ0FBQyxVQUFDLENBQUM7WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUdNLDBDQUFnQixHQUF2QjtRQUVJLElBQUksQ0FBQyxhQUFhLENBQUMseUJBQXlCLEVBQUUsQ0FBQztJQUVuRCxDQUFDO0lBRU0sNENBQWtCLEdBQXpCO1FBRUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBRTVDLENBQUM7SUFFTSwwQ0FBZ0IsR0FBdkIsVUFBd0IsS0FBYSxFQUFFLElBQVk7UUFFL0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFckQsQ0FBQztJQUdNLHlDQUFlLEdBQXRCLFVBQXVCLElBQVk7UUFBbkMsaUJBYUM7UUFYRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsR0FBRztZQUdwRCxLQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0IsS0FBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLEtBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxFQUFFLFVBQUMsQ0FBQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDO0lBR0wsc0JBQUM7QUFBRCxDQUFDLEFBNUVELENBQXFDLHVCQUFVLEdBNEU5QztBQTVFWSwwQ0FBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnZGF0YS9vYnNlcnZhYmxlJztcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd1aS9wYWdlJztcbmltcG9ydCAqIGFzIGFwcCBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvblwiO1xudmFyIGh0dHAgPSByZXF1aXJlKFwiaHR0cFwiKTtcblxuaW1wb3J0IHsgTG9jYWxWaWRlbywgUmVtb3RlVmlkZW8sIFZpZGVvQWN0aXZpdHkgfSBmcm9tICduYXRpdmVzY3JpcHQtdHdpbGlvLXZpZGVvJztcblxuXG5cbnZhciB0aW1lciA9IHJlcXVpcmUoXCJ0aW1lclwiKTtcbnZhciBwZXJtaXNzaW9ucyA9IHJlcXVpcmUoJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucycpO1xuXG5cblxuXG5leHBvcnQgY2xhc3MgSGVsbG9Xb3JsZE1vZGVsIGV4dGVuZHMgT2JzZXJ2YWJsZSB7XG4gICAgdmlkZW9BY3Rpdml0eTogVmlkZW9BY3Rpdml0eTtcbiAgICAvLyBnYW1lIG1vZGUgcmVhZCBteSBsaXBzXG4gICAgcHJpdmF0ZSBsb2NhbFZpZGVvOiBhbnk7XG4gICAgcHJpdmF0ZSBhY2Nlc3NUb2tlbjogc3RyaW5nO1xuICAgIHByaXZhdGUgcm9vbU5hbWU6IHN0cmluZztcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHByaXZhdGUgaGVyb3M6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFnZTogUGFnZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnZpZGVvQWN0aXZpdHkgPSBuZXcgVmlkZW9BY3Rpdml0eSgpO1xuICAgICAgICB0aGlzLmdldFBlcm1pc3Npb25zKCk7XG4gICAgICAgIC8vIGNvbnNvbGUuZGlyKHRoaXMpO1xuICAgICAgICBjb25zb2xlLmRpcih0aGlzLnZpZGVvQWN0aXZpdHkpO1xuICAgICAgICB0aGlzLm9uKCdvbkNvbm5lY3RlZCcsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnd29ya2luZycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIHRoaXMudmlkZW9BY3Rpdml0eS52aWRlb0V2ZW50Lm9uKCdvbkNvbm5lY3RlZCcsIChkYXRhKSA9PiB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgLy8gfSlcbiAgICB9XG5cblxuXG4gICAgZ2V0UGVybWlzc2lvbnMoKTogdm9pZCB7XG5cbiAgICAgICAgcGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb25zKFtcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUNPUkRfQVVESU8sXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uQ0FNRVJBXG4gICAgICAgICAgICBdLCBcIkkgbmVlZCB0aGVzZSBwZXJtaXNzaW9ucyBiZWNhdXNlIEknbSBjb29sXCIpXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRpcihlKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVoIG9oLCBubyBwZXJtaXNzaW9ucyAtIHBsYW4gQiB0aW1lIVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIHNob3dfbG9jYWxfdmlkZW8oKSB7XG5cbiAgICAgICAgdGhpcy52aWRlb0FjdGl2aXR5LmNyZWF0ZUF1ZGlvQW5kVmlkZW9UcmFja3MoKTtcblxuICAgIH1cblxuICAgIHB1YmxpYyB0b2dnbGVfbG9jYWxfdmlkZW8oKSB7XG5cbiAgICAgICAgdGhpcy52aWRlb0FjdGl2aXR5LnRvZ2dsZV9sb2NhbF92aWRlbygpO1xuXG4gICAgfVxuXG4gICAgcHVibGljIHNldF9hY2Nlc3NfdG9rZW4odG9rZW46IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG5cbiAgICAgICAgdGhpcy52aWRlb0FjdGl2aXR5LnNldF9hY2Nlc3NfdG9rZW4odG9rZW4sIG5hbWUpO1xuXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgY29ubmVjdF90b19yb29tKHJvb206IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBcbiAgICAgICAgaHR0cC5nZXRKU09OKCdodHRwOi8vYWM4NjVmZjIubmdyb2suaW8vdG9rZW4nKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnNldCgnbmFtZScsIHJlcy5pZGVudGl0eSk7XG4gICAgICAgICAgICB0aGlzLnNldF9hY2Nlc3NfdG9rZW4ocmVzLnRva2VuLCByZXMuaWRlbnRpdHkpO1xuICAgICAgICAgICAgdGhpcy52aWRlb0FjdGl2aXR5LmNvbm5lY3RfdG9fcm9vbSgnY2hhbmdlMycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2hpdCcpO1xuICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICB9XG5cblxufSJdfQ==
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Room = com.twilio.video.Room;
var Listeners = (function () {
    function Listeners() {
    }
    Listeners.roomListener = function (audioConfig) {
        return new Room.Listener({
            onConnected: function (room) {
                this.localParticipant = room.getLocalParticipant();
                console.log('connected to: ' + room.getName());
            },
            onConnectFailure: function (room, error) {
                console.log("failed to connect");
                console.log(error);
                this.configureAudio(false);
            },
            onDisconnected: function (room, error) {
                console.log("Disconnected from " + room.getName());
                this.room = null;
                this.configureAudio(false);
            },
            onParticipantConnected: function (room, participant) {
                this.addParticipant(participant);
            },
            onParticipantDisconnected: function (room, participant) {
                this.removeParticipant(participant);
            },
            onRecordingStarted: function (room) {
                console.log('onRecordingStarted');
            },
            onRecordingStopped: function (room) {
                console.log('onRecordingStopped');
            }
        });
    };
    return Listeners;
}());
exports.Listeners = Listeners;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbUxpc3RlbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicm9vbUxpc3RlbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBRW5DO0lBQUE7SUEwQ0EsQ0FBQztJQXhDVSxzQkFBWSxHQUFuQixVQUFvQixXQUFXO1FBQzNCLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDckIsV0FBVyxZQUFDLElBQUk7Z0JBQ1osSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELENBQUM7WUFDRCxnQkFBZ0IsWUFBQyxJQUFJLEVBQUUsS0FBSztnQkFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9CLENBQUM7WUFDRCxjQUFjLFlBQUMsSUFBSSxFQUFFLEtBQUs7Z0JBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUdqQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBSS9CLENBQUM7WUFDRCxzQkFBc0IsWUFBQyxJQUFJLEVBQUUsV0FBVztnQkFDcEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBQ0QseUJBQXlCLFlBQUMsSUFBSSxFQUFFLFdBQVc7Z0JBQ3ZDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQ0Qsa0JBQWtCLFlBQUMsSUFBSTtnQkFLbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFDRCxrQkFBa0IsWUFBQyxJQUFJO2dCQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDdEMsQ0FBQztTQUVKLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCxnQkFBQztBQUFELENBQUMsQUExQ0QsSUEwQ0M7QUExQ1ksOEJBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmRlY2xhcmUgdmFyIGNvbSwgYW5kcm9pZDogYW55O1xuY29uc3QgUm9vbSA9IGNvbS50d2lsaW8udmlkZW8uUm9vbTtcblxuZXhwb3J0IGNsYXNzIExpc3RlbmVycyB7XG5cbiAgICBzdGF0aWMgcm9vbUxpc3RlbmVyKGF1ZGlvQ29uZmlnKTogYW55IHtcbiAgICAgICAgcmV0dXJuIG5ldyBSb29tLkxpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQ29ubmVjdGVkKHJvb20pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsUGFydGljaXBhbnQgPSByb29tLmdldExvY2FsUGFydGljaXBhbnQoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY29ubmVjdGVkIHRvOiAnICsgcm9vbS5nZXROYW1lKCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ29ubmVjdEZhaWx1cmUocm9vbSwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhaWxlZCB0byBjb25uZWN0XCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUF1ZGlvKGZhbHNlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkRpc2Nvbm5lY3RlZChyb29tLCBlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRGlzY29ubmVjdGVkIGZyb20gXCIgKyByb29tLmdldE5hbWUoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yb29tID0gbnVsbDtcbiAgICAgICAgICAgICAgICAvLyBPbmx5IHJlaW5pdGlhbGl6ZSB0aGUgVUkgaWYgZGlzY29ubmVjdCB3YXMgbm90IGNhbGxlZCBmcm9tIG9uRGVzdHJveSgpXG4gICAgICAgICAgICAgICAgLy8gaWYgKCFkaXNjb25uZWN0ZWRGcm9tT25EZXN0cm95KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmVBdWRpbyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgLy8gICAgIGludGlhbGl6ZVVJKCk7XG4gICAgICAgICAgICAgICAgLy8gICAgIG1vdmVMb2NhbFZpZGVvVG9QcmltYXJ5VmlldygpO1xuICAgICAgICAgICAgICAgIC8vIH0gXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25QYXJ0aWNpcGFudENvbm5lY3RlZChyb29tLCBwYXJ0aWNpcGFudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkUGFydGljaXBhbnQocGFydGljaXBhbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUGFydGljaXBhbnREaXNjb25uZWN0ZWQocm9vbSwgcGFydGljaXBhbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVBhcnRpY2lwYW50KHBhcnRpY2lwYW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblJlY29yZGluZ1N0YXJ0ZWQocm9vbSkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICogSW5kaWNhdGVzIHdoZW4gbWVkaWEgc2hhcmVkIHRvIGEgUm9vbSBpcyBiZWluZyByZWNvcmRlZC4gTm90ZSB0aGF0XG4gICAgICAgICAgICAgICAgICogcmVjb3JkaW5nIGlzIG9ubHkgYXZhaWxhYmxlIGluIG91ciBHcm91cCBSb29tcyBkZXZlbG9wZXIgcHJldmlldy5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25SZWNvcmRpbmdTdGFydGVkJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZWNvcmRpbmdTdG9wcGVkKHJvb20pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25SZWNvcmRpbmdTdG9wcGVkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfVxufSJdfQ==
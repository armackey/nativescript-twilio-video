import { Observable, fromObject } from 'tns-core-modules/data/observable';

declare var TVIVideoViewDelegate, TVICameraCapturerDelegate, TVIParticipantDelegate, TVIRoomDelegate;

export class DelegateEvents {

    static _events: Observable = new Observable();

}

export class VideoViewDelegate extends NSObject {

    public static ObjCProtocols = [TVIVideoViewDelegate];

    private _events: Observable;

    private _owner: WeakRef<any>;

    public static initWithOwner(owner: WeakRef<any>): VideoViewDelegate {

        let videoViewDelegate = new VideoViewDelegate();

        videoViewDelegate._events = DelegateEvents._events

        videoViewDelegate._owner = owner;

        return videoViewDelegate;

    }


    public videoViewDidReceiveData(view: any) {
        console.log('videoViewDidReceiveData');
        if (this._events) {
            this._events.notify({
                eventName: 'videoViewDidReceiveData',
                object: fromObject({
                    view: view,
                })
            });
        }
    }

    public videoViewVideoDimensionsDidChange(view: any, dimensions: any) {
        console.log('videoDimensionsDidChange');
        if (this._events) {
            this._events.notify({
                eventName: 'videoDimensionsDidChange',
                object: fromObject({
                    view: view,
                    dimensions: dimensions
                })
            });
        }
    }

    public videoViewVideoOrientationDidChange(view: any, orientation: any) {
        console.log('videoViewVideoOrientationDidChange');
        if (this._events) {
            this._events.notify({
                eventName: 'videoViewVideoOrientationDidChange',
                object: fromObject({
                    view: view,
                    orientation: orientation
                })
            });
        }
    }

    get events(): Observable {

        return this._events;

    }

}


export class CameraCapturerDelegate extends NSObject {

    public static ObjCProtocols = [TVICameraCapturerDelegate]; // define our native protocalls

    private _events: Observable;

    private _owner: WeakRef<any>;

    public static initWithOwner(owner: WeakRef<any>): CameraCapturerDelegate {

        let cameraCapturerDelegate = new CameraCapturerDelegate();

        cameraCapturerDelegate._events = DelegateEvents._events

        cameraCapturerDelegate._owner = owner;

        return cameraCapturerDelegate;

    }

    public cameraCapturerPreviewDidStart(capturer: any) {
        console.log('cameraCapturerPreviewDidStart');
        if (this._events) {
            this._events.notify({
                eventName: 'cameraCapturerPreviewDidStart',
                object: fromObject({
                    capturer: capturer,
                })
            });
        }
    }

    public cameraCapturerDidStartWithSource(capturer: any, didStartWithSource: any) {
        console.log('cameraCapturer didStartWithSource');
        if (this._events) {
            this._events.notify({
                eventName: 'cameraCapturer',
                object: fromObject({
                    capturer: capturer,
                    didStartWith: didStartWithSource
                })
            });
        }
    }


    public cameraCapturerWasInterrupted(capturer: any) {
        console.log('cameraCapturerWasInterrupted');
        if (this._events) {
            this._events.notify({
                eventName: 'cameraCapturerWasInterrupted',
                object: fromObject({
                    capturer: capturer,
                })
            });
        }
    }

    public cameraCapturerDidFailWithError(capturer: any) {
        console.log('didFailWithError');
        if (this._events) {
            this._events.notify({
                eventName: 'didFailWithError',
                object: fromObject({
                    capturer: capturer,
                })
            });
        }
    }

    get events(): Observable {

        return this._events;

    }

}

export class RoomDelegate extends NSObject {

    static ObjCProtocols = [TVIRoomDelegate]; // define our native protocalls

    private _events: Observable;

    private _owner: WeakRef<any>;

    public _participantDelegate: ParticipantDelegate;

    public static initWithOwner(owner: WeakRef<any>): RoomDelegate {

        let roomDelegate = new RoomDelegate();

        roomDelegate._events = DelegateEvents._events

        roomDelegate._owner = owner;

        return roomDelegate;

    }

    public didConnectToRoom(room): void {

        if (this._events) {
            this._events.notify({
                eventName: 'onConnected',
                object: fromObject({
                    room: room
                })
            })
        }
        console.log('connected to a room');
    }    

    public roomParticipantDidConnect(room, participant): void {
        if (this._events) {
            this._events.notify({
                eventName: 'onParticipantConnected',
                object: fromObject({
                    room: room,
                    participant: participant
                })
            })
        }

        console.log('participantDidConnect');

    }
    public roomParticipantDidDisconnect(room, participant): void {
        if (this._events) {
            this._events.notify({
                eventName: 'onParticipantDisconnected',
                object: fromObject({
                    room: room,
                    participant: participant
                })
            })
        }
        console.log('participantDidDisconnect');
    }



    public roomDidFailToConnectWithError(room, error): void {
        if (this._events) {
            this._events.notify({
                eventName: 'onConnectFailure',
                object: fromObject({
                    room: room,
                    error: error
                })
            })
        }
        console.log('didFailToConnectWithError');
    };

    public roomDidDisconnectWithError(room, error): void {
        if (this._events) {
            this._events.notify({
                eventName: 'didDisconnectWithError',
                object: fromObject({
                    room: room,
                    error: error
                })
            })
        }
        console.log('didDisconnectWithError')
    };

    roomDidStartRecording(room): void {
        if (this._events) {
            this._events.notify({
                eventName: 'roomDidStartRecording',
                object: fromObject({
                    room: room,
                })
            })
        }
        console.log('roomDidStartRecording')
    }
    roomDidStopRecording(room): void {
        if (this._events) {
            this._events.notify({
                eventName: 'roomDidStopRecording',
                object: fromObject({
                    room: room,
                })
            })
        }
        console.log('roomDidStopRecording')
    }

    get events(): Observable {

        return this._events;

    }

}


export class ParticipantDelegate extends NSObject {

    static ObjCProtocols = [TVIParticipantDelegate]; // define our native protocalls

    private _events: Observable;
    private _owner: WeakRef<any>;

    public static initWithOwner(owner: WeakRef<any>): ParticipantDelegate {

        let participantDelegate = new ParticipantDelegate();

        participantDelegate._events = DelegateEvents._events

        participantDelegate._owner = owner;

        return participantDelegate;

    }


    public participantAddedVideoTrack(participant, videoTrack): void {
        if (this._events) {
            this._events.notify({
                eventName: 'onVideoTrackAdded',
                object: fromObject({
                    participant: participant,
                    videoTrack: videoTrack
                })
            })
        }

    }

    public participantRemovedVideoTrack(participant, videoTrack): void {
        console.log('onVideoTrackRemoved');
        if (this._events) {
            this._events.notify({
                eventName: 'onVideoTrackRemoved',
                object: fromObject({
                    participant: participant,
                    videoTrack: videoTrack
                })
            })
        }        
    }

    public participantAddedAudioTrack(participant, audioTrack): void {
        console.log('onAudioTrackAdded');
        if (this._events) {
            this._events.notify({
                eventName: 'onAudioTrackAdded',
                object: fromObject({
                    participant: participant,
                    videoTrack: audioTrack
                })
            })
        }  
    }

    public participantRemovedAudioTrack(participant, audioTrack): void {
        console.log('onAudioTrackRemoved');
        if (this._events) {
            this._events.notify({
                eventName: 'onAudioTrackRemoved',
                object: fromObject({
                    participant: participant,
                    videoTrack: audioTrack
                })
            })
        } 
    }

    public participantEnabledTrack(participant, track): void {
        console.log('enabledTrack(p');
    }

    public participantDisabledTrack(participant, track): void {
        console.log('disabledTrack(');
    }


    get events(): Observable {

        return this._events;

    }

}
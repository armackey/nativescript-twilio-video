import { Observable, fromObject } from 'tns-core-modules/data/observable';

declare var TVIVideoViewDelegate, TVICameraCapturerDelegate, TVIRemoteParticipantDelegate, TVIRoomDelegate;
// TVIRemoteParticipantDelegate
// TVIParticipantDelegate

export class DelegateEvents {

    static _event: Observable = new Observable();

}

export class RoomDelegate extends NSObject {

    static ObjCProtocols = [TVIRoomDelegate]; // define our native protocalls

    private _event: Observable;

    private _owner: WeakRef<any>;

    public _participantDelegate: RoomDelegate;

    context: any;

    public static initWithOwner(owner: WeakRef<any>, ctx): RoomDelegate {

        let roomDelegate = new RoomDelegate();

        roomDelegate._event = DelegateEvents._event

        roomDelegate._owner = owner;

        roomDelegate.context = ctx;

        return roomDelegate;

    }

    public didConnectToRoom(room): void {

        this.context.connectToRoomWithListener(room);

        this._event.notify({
            eventName: 'didConnectToRoom',
            object: fromObject({
                room: room,
                count: room.remoteParticipants.count
            })
        })
        console.log('didConnectToRoom');
    }

    public roomParticipantDidConnect(room, participant): void {
        console.log('roomParticipantDidConnect');
        // if (!this.context.remoteParticipant || this.context.remoteParticipant === null) {
        //     this.context.remoteParticipant = participant;
        //     this.context.remoteParticipant.delegate = this;
        // }
        this.context.participant_joined_room(participant);

        this._event.notify({
            eventName: 'participantDidConnect',
            object: fromObject({
                room: room,
                participant: participant,
                count: room.remoteParticipants.count
            })
        })

        console.log('participantDidConnect');

    }
    public roomParticipantDidDisconnect(room, participant): void {

        if (this.context.remoteParticipants === participant) {
            console.log('roomParticipantDidDisconnect');
            this.context.cleanupRemoteParticipant();
        }

        this._event.notify({
            eventName: 'participantDidDisconnect',
            object: fromObject({
                room: room,
                participant: participant
            })
        })
        console.log('participantDidDisconnect');
    }



    public roomDidFailToConnectWithError(room, error): void {
        this._event.notify({
            eventName: 'didFailToConnectWithError',
            object: fromObject({
                room: room,
                error: error
            })
        })
        console.log('didFailToConnectWithError');
    };

    public roomDidDisconnectWithError(room, error): void {
        this.context.cleanupRemoteParticipant();
        this._event.notify({
            eventName: 'disconnectedWithError',
            object: fromObject({
                room: room,
                error: error
            })
        })
        console.log('disconnectedWithError')
    };

    roomDidStartRecording(room): void {
        //     this._event.notify({
        //         eventName: 'roomDidStartRecording',
        //         object: fromObject({
        //             room: room,
        //         })
        //     })
        console.log('roomDidStartRecording')
    }
    roomDidStopRecording(room): void {
        //     this._event.notify({
        //         eventName: 'roomDidStopRecording',
        //         object: fromObject({
        //             room: room,
        //         })
        //     })
        console.log('roomDidStopRecording')
    }

    get events(): Observable {

        return this._event;

    }

}


export class RemoteParticipantDelegate extends NSObject {

    static ObjCProtocols = [TVIRemoteParticipantDelegate]; // define our native protocalls

    private _event: Observable;
    private _owner: WeakRef<any>;
    context: any;

    public static initWithOwner(owner: WeakRef<any>, ctx): RemoteParticipantDelegate {

        let remoteParticipantDelegate = new RemoteParticipantDelegate();

        remoteParticipantDelegate._event = DelegateEvents._event

        remoteParticipantDelegate._owner = owner;

        remoteParticipantDelegate.context = ctx;

        return remoteParticipantDelegate;

    }


    public remoteParticipantPublishedVideoTrack(participant, publication): void {
        this._event.notify({
            eventName: 'participantPublishedVideoTrack',
            object: fromObject({
                participant: participant,
                publication: publication,
            })
        })
    }

    public remoteParticipantUnpublishedVideoTrack(participant, publication): void {
        this._event.notify({
            eventName: 'participantUnpublishedVideoTrack',
            object: fromObject({
                participant: participant,
                publication: publication,
            })
        })
    }

    public remoteParticipantPublishedAudioTrack(participant, publication): void {
        this._event.notify({
            eventName: 'participantPublishedAudioTrack',
            object: fromObject({
                participant: participant,
                publication: publication,
            })
        })
    }

    public remoteParticipantUnpublishedAudioTrack(participant, publication): void {
        this._event.notify({
            eventName: 'participantUnpublishedAudioTrack',
            object: fromObject({
                participant: participant,
                publication: publication,
            })
        })
    }

    public subscribedToVideoTrackPublicationForParticipant(videoTrack, publication, participant): void {
        // console.dir(this.context.remoteVideoView)
        videoTrack.addRenderer(this.context.remoteVideoView);
        this.context.videoTrack = videoTrack;

        // this.context.setupRemoteView(videoTrack, participant);
        this._event.notify({
            eventName: 'onVideoTrackSubscribed',
            object: fromObject({
                videoTrack: videoTrack,
                publication: publication,
                participant: participant
            })
        })
        // if (self.remoteParticipant == participant) {
        //     [self setupRemoteView];
        //     [videoTrack addRenderer:self.remoteView];
        // }
    }

    public unsubscribedFromVideoTrackPublicationForParticipant(videoTrack, publication, participant): void {

        videoTrack.removeRenderer(this.context.remoteVideoView);
        this.context.remoteVideoView.removeFromSuperview();

        this._event.notify({
            eventName: 'onVideoTrackUnsubscribed',
            object: fromObject({
                videoTrack: videoTrack,
                publication: publication,
                participant: participant
            })
        })

        // if (self.remoteParticipant == participant) {
        //     [videoTrack removeRenderer:self.remoteView];
        //     [self.remoteView removeFromSuperview];
        // }

    }

    public subscribedToAudioTrackPublicationForParticipant(audioTrack, publication, participant): void {
        this._event.notify({
            eventName: 'onAudioTrackSubscribed',
            object: fromObject({
                audioTrack: audioTrack,
                publication: publication,
                participant: participant
            })
        })
    }

    public unsubscribedFromAudioTrackPublicationForParticipant(videoTrack, publication, participant): void {
        this._event.notify({
            eventName: 'onAudioTrackUnsubscribed',
            object: fromObject({
                videoTrack: videoTrack,
                publication: publication,
                participant: participant
            })
        });
    }

    public remoteParticipantEnabledVideoTrack(participant, publication): void {
        this._event.notify({
            eventName: 'participantEnabledVideoTrack',
            object: fromObject({
                publication: publication,
                participant: participant
            })
        });
    }

    public remoteParticipantDisabledVideoTrack(participant, publication): void {
        this._event.notify({
            eventName: 'participantDisabledVideoTrack',
            object: fromObject({
                publication: publication,
                participant: participant
            })
        });
    }

    public remoteParticipantEnabledAudioTrack(participant, publication): void {
        this._event.notify({
            eventName: 'participantEnabledAudioTrack',
            object: fromObject({
                publication: publication,
                participant: participant
            })
        });
    }

    public remoteParticipantDisabledAudioTrack(participant, publication): void {
        this._event.notify({
            eventName: 'participantDisabledAudioTrack',
            object: fromObject({
                publication: publication,
                participant: participant
            })
        });
    }

    get events(): Observable {

        return this._event;

    }

}

export class VideoViewDelegate extends NSObject {

    public static ObjCProtocols = [TVIVideoViewDelegate];

    private _event: Observable;

    private _owner: WeakRef<any>;

    public static initWithOwner(owner: WeakRef<any>): VideoViewDelegate {

        let videoViewDelegate = new VideoViewDelegate();

        videoViewDelegate._event = DelegateEvents._event

        videoViewDelegate._owner = owner;

        return videoViewDelegate;

    }


    public videoViewDidReceiveData(view: any) {
        console.log('videoViewDidReceiveData');
        this._event.notify({
            eventName: 'videoViewDidReceiveData',
            object: fromObject({
                view: view,
            })
        });
    }

    // public videoViewVideoDimensionsDidChange(view: any, dimensions: any) {
    //     console.log('videoDimensionsDidChange');
    //         this._event.notify({
    //             eventName: 'videoDimensionsDidChange',
    //             object: fromObject({
    //                 view: view,
    //                 dimensions: dimensions
    //             })
    //         });
    //     }
    // }

    // public videoViewVideoOrientationDidChange(view: any, orientation: any) {
    //     console.log('videoViewVideoOrientationDidChange');
    //         this._event.notify({
    //             eventName: 'videoViewVideoOrientationDidChange',
    //             object: fromObject({
    //                 view: view,
    //                 orientation: orientation
    //             })
    //         });
    //     }
    // }

    get events(): Observable {

        return this._event;

    }

}

export class CameraCapturerDelegate extends NSObject {

    public static ObjCProtocols = [TVICameraCapturerDelegate]; // define our native protocalls

    private _event: Observable;

    private _owner: WeakRef<any>;

    public static initWithOwner(owner: WeakRef<any>): CameraCapturerDelegate {

        let cameraCapturerDelegate = new CameraCapturerDelegate();

        cameraCapturerDelegate._event = DelegateEvents._event

        cameraCapturerDelegate._owner = owner;

        return cameraCapturerDelegate;

    }

    // public cameraCapturerPreviewDidStart(capturer: any) {

    //         this._event.notify({
    //             eventName: 'cameraCapturerPreviewDidStart',
    //             object: fromObject({
    //                 capturer: capturer,
    //             })
    //         });
    //     }
    // }

    public cameraCapturerDidStartWithSource(capturer: any, source: any) {
        console.log('cameraCapturer didStartWithSource');
        this._event.notify({
            eventName: 'cameraCapturer',
            object: fromObject({
                capturer: capturer,
                source: source
            })
        });
    }


    public cameraCapturerWasInterrupted(capturer: any, reason: any) {
        console.log('cameraCapturerWasInterrupted');
        this._event.notify({
            eventName: 'cameraCapturerWasInterrupted',
            object: fromObject({
                capturer: capturer,
                reason: reason,
            })
        });
    }

    public cameraCapturerDidFailWithError(capturer: any, error: any) {
        console.log('cameraCapturerDidFailWithError');
        this._event.notify({
            eventName: 'cameraCapturerDidFailWithError',
            object: fromObject({
                capturer: capturer,
                error: error,
            })
        });
    }

    get events(): Observable {

        return this._event;

    }

}

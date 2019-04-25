import { Observable } from 'tns-core-modules/data/observable';
declare var NSObject: any;
export declare class DelegateEvents {
    static _event: Observable;
}
export declare class RoomDelegate extends NSObject {
    static ObjCProtocols: any[];
    private _event;
    private _owner;
    _participantDelegate: RoomDelegate;
    context: any;
    static initWithOwner(owner: WeakRef<any>, ctx: any): RoomDelegate;
    didConnectToRoom(room: any): void;
    roomParticipantDidConnect(room: any, participant: any): void;
    roomParticipantDidDisconnect(room: any, participant: any): void;
    roomDidFailToConnectWithError(room: any, error: any): void;
    roomDidDisconnectWithError(room: any, error: any): void;
    roomDidStartRecording(room: any): void;
    roomDidStopRecording(room: any): void;
    readonly events: Observable;
}
export declare class RemoteParticipantDelegate extends NSObject {
    static ObjCProtocols: any[];
    private _event;
    private _owner;
    context: any;
    static initWithOwner(owner: WeakRef<any>, ctx: any): RemoteParticipantDelegate;
    remoteParticipantPublishedVideoTrack(participant: any, publication: any): void;
    remoteParticipantUnpublishedVideoTrack(participant: any, publication: any): void;
    remoteParticipantPublishedAudioTrack(participant: any, publication: any): void;
    remoteParticipantUnpublishedAudioTrack(participant: any, publication: any): void;
    subscribedToVideoTrackPublicationForParticipant(videoTrack: any, publication: any, participant: any): void;
    unsubscribedFromVideoTrackPublicationForParticipant(videoTrack: any, publication: any, participant: any): void;
    subscribedToAudioTrackPublicationForParticipant(audioTrack: any, publication: any, participant: any): void;
    unsubscribedFromAudioTrackPublicationForParticipant(videoTrack: any, publication: any, participant: any): void;
    remoteParticipantEnabledVideoTrack(participant: any, publication: any): void;
    remoteParticipantDisabledVideoTrack(participant: any, publication: any): void;
    remoteParticipantEnabledAudioTrack(participant: any, publication: any): void;
    remoteParticipantDisabledAudioTrack(participant: any, publication: any): void;
    readonly events: Observable;
}
export declare class VideoViewDelegate extends NSObject {
    static ObjCProtocols: any[];
    private _event;
    private _owner;
    static initWithOwner(owner: WeakRef<any>): VideoViewDelegate;
    videoViewDidReceiveData(view: any): void;
    readonly events: Observable;
}
export declare class CameraCapturerDelegate extends NSObject {
    static ObjCProtocols: any[];
    private _event;
    private _owner;
    static initWithOwner(owner: WeakRef<any>): CameraCapturerDelegate;
    cameraCapturerDidStartWithSource(capturer: any, source: any): void;
    cameraCapturerWasInterrupted(capturer: any, reason: any): void;
    cameraCapturerDidFailWithError(capturer: any, error: any): void;
    readonly events: Observable;
}
export {};

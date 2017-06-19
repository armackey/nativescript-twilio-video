
import { RemoteVideo } from "./remoteVideo";
import { LocalVideo } from "./localVideo";
import { Observable, fromObject } from 'tns-core-modules/data/observable';
import { VideoActivityBase } from "../twilio-common";


declare var TVIParticipant, 
            TVIVideoRenderer, 
            TVIConnectOptions,
            TVIConnectOptionsBuilder;

export class VideoActivity implements VideoActivityBase {

    private TWILIO_ACCESS_TOKEN: string;
    public previousAudioMode: any;
    public localVideoView: any;
    public remoteVideoView: any;
    public localVideoTrack: any;
    public localAudioTrack: any;
    public cameraCapturer: any;
    public accessToken: string;
    public room: string;
    public participantIdentity: string;
    public previousMicrophoneMute: boolean;
    public localParticipant: any;
    public audioManager: any;
    public name: string;
    public videoEvent: Observable;
    private _roomListener: any;
    private _participantListener: any;



    constructor(){
        // let localVideo = new LocalVideo();
        // let remoteVideo = new RemoteVideo();
        // this.localVideoView = localVideo.get_local_view();
        // this.remoteVideoView = remoteVideo.get_remote_view();
    }

    public connect_to_room(roomName: string) {

        if (!this.accessToken) return; // getToken();

        console.log(roomName);
        console.log(this.accessToken);

        // self.prepareLocalMedia()
        // Preparing the connect options with the access token that we fetched (or hardcoded).
        // console.log(TVIConnectOptions.optionsWithToken);
        console.dir(TVIConnectOptions);
        let optionsWithBlock = TVIConnectOptions.options;
        optionsWithBlock();        
        // let connectOptions = TVIConnectOptions.init();
        // console.log(connectOptions);
        // let connectOptions = TVIConnectOptions.init(this.accessToken, function(builder) {
        //     console.dir(builder);
        // }) //{ (builder) in

        // connectOptions.builder.audioTracks = 
            // Use the local media that we prepared earlier.
        // builder.audioTracks = self.localAudioTrack != nil ? [self.localAudioTrack!] : [TVILocalAudioTrack]()
        // builder.videoTracks = self.localVideoTrack != nil ? [self.localVideoTrack!] : [TVILocalVideoTrack]()

        // // The name of the Room where the Client will attempt to connect to. Please note that if you pass an empty
        // // Room `name`, the Client will create one for you. You can get the name or sid from any connected Room.
        // builder.roomName = self.roomTextField.text
    // }

    // Connect to the Room using the options we provided.
    // room = TwilioVideo.connect(with: connectOptions, delegate: self)
        
    // logMessage(messageText: "Attempting to connect to room \(String(describing: self.roomTextField.text))")

    // self.showRoomUI(inRoom: true)
    // self.dismissKeyboard()        

    }

    public configureAudio() {

    }

    public removeParticipantVideo() {

    }

    public participantListener() {

    }

    public removeParticipant() {

    }

    public addParticipantVideo() {

    }

    public addParticipant() {

    }

    public set_access_token(token: string, name: string) {

        this.accessToken = token;

    }

    public disconnect_from_room() {

    }

    public roomListener() {

    }


    public createAudioAndVideoTracks() {
        // TVICameraCapturer
    }

    public toggle_local_video() {

    }

    public toggle_local_audio() {

    }

    public destroy_local_video() {

    }

    public destroy_local_audio() {

    }


}
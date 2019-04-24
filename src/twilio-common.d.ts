export interface VideoActivityBase {
	start_preview(): void;
    toggle_local_video(): void;
    toggle_local_audio(): void;
    connect_to_room(roomName: string): void;
    set_access_token(token: string, name: string): void;
    disconnect(): void;
}

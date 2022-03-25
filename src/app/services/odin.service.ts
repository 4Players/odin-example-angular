import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {TokenGenerator} from "@4players/odin-tokens";
import {OdinClient, OdinConnectionState, OdinPeer, OdinRoom} from "@4players/odin";

@Injectable({
  providedIn: 'root'
})
/**
 * The OdinService manages for example the connection, the OdinRoom and the OdinPeers.
 */
export class OdinService {
  connectionState$ = new BehaviorSubject<OdinConnectionState>(OdinConnectionState.disconnected);
  peers: Map<number, OdinPeer> = new Map();
  peers$: BehaviorSubject<Map<number, OdinPeer>> = new BehaviorSubject<Map<number, OdinPeer>>(this.peers);
  room!: OdinRoom;

  constructor() {}

  /**
   * Generate the token locally and connect to the room.
   * IMPORTANT: The token is generated locally ONLY for testing purpose. In a real world application,
   * the token is provided from a server.
   * @param accessKey
   * @param roomName
   * @param userName
   */
  async connect(accessKey: string, roomName: string, userName: string) {
    if (!accessKey) {
      throw new Error('Please provide an access key!');
    }
    const tokenGenerator = new TokenGenerator(accessKey);
    const token = tokenGenerator.createToken(roomName, userName);
    try {
      this.room = await OdinClient.initRoom(token);
      this.roomHandler(this.room);
      await this.room.join(this.stringToByteArray(userName));
      this.getDefaultMediaStream().then( ms => {
        this.room.createMedia(ms);
      });
    } catch (e) {
      this.connectionState$.next(OdinConnectionState.error);
    }
  }

  /**
   * Handle all room events
   * @param room
   */
  roomHandler(room: OdinRoom) {
    room.addEventListener('ConnectionStateChanged', (connectionState) => {
      const state = connectionState.payload.newState;
      this.connectionState$.next(state);
    });
    room.addEventListener('PeerJoined', (peerJoinedEvent) => {
      const peer = peerJoinedEvent.payload.peer;
      this.peers.set(peer.id, peer);
      this.peers$.next(this.peers);
    });
    room.addEventListener('PeerLeft', (peerLeftEvent) => {
      const peer = peerLeftEvent.payload.peer;
      this.peers.delete(peer.id);
      this.peers$.next(this.peers);
    });
    room.addEventListener('MediaStarted', ( mediaStarted ) => {
      mediaStarted.payload.media.start().then();
    });
  }

  /**
   * Disconnect the OdinClient and its rooms.
   */
  disconnect() {
    OdinClient.disconnect();
    this.peers$.next(new Map());
    this.connectionState$.next(OdinConnectionState.disconnected);
  }

  /**
   * Get the MediaStream for the default device.
   */
  getDefaultMediaStream(): Promise<MediaStream> {
    return navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
          sampleRate: 48000,
        },
      });
  }

  /**
   * Helper function to convert user data from string to byte-array.
   */
  stringToByteArray(str: string): Uint8Array {
    const utf8Encode = new TextEncoder();
    return utf8Encode.encode(str);
  }

  /**
   * Helper function to convert user data from byte-array to string.
   */
  byteArrayToString(bytes: Uint8Array) {
    const utf8Decode = new TextDecoder();
    return utf8Decode.decode(bytes);
  }
}

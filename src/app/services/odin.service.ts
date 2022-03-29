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
  /**
   * Emits the connection state of the OdinRoom.
   */
  connectionState$ = new BehaviorSubject<OdinConnectionState>(OdinConnectionState.disconnected);
  /**
   * Holds the OdinPeers that are in the room.
   */
  peers: Map<number, OdinPeer> = new Map();
  /**
   * Emits the OdinPeers that are in the room (For Component updates for example).
   */
  peers$: BehaviorSubject<Map<number, OdinPeer>> = new BehaviorSubject<Map<number, OdinPeer>>(this.peers);
  /**
   * Holds the room
   */
  room!: OdinRoom;

  constructor() {}

  /**
   * Connects to an OdinRoom with the locally generated access Key.
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
    // Generates the token.
    const tokenGenerator = new TokenGenerator(accessKey);
    const token = tokenGenerator.createToken(roomName, userName);
    try {
      // Initializes and stores the OdinRoom.
      this.room = await OdinClient.initRoom(token);
      // Adds Handlers for the OdinRoom before joining.
      // This makes it possible to fetch Peers that were already in the room before.
      this.roomHandler(this.room);
      // Joins the room and pass userData (in this case the userName)
      await this.room.join(this.stringToByteArray(userName));
      // Fetches the MediaStream for the default input device and create a OdinMedia.
      // The own OdinMedia takes care of encoding and transmitting voice to the Odin Server.
      // IMPORTANT: To be able to speak, the own OdinMedia has to get started (Happens in this.roomHandler()).
      this.getDefaultMediaStream().then( ms => {
        this.room.createMedia(ms);
      });
    } catch (e) {
      // Emits the OdinConnectionState to error.
      this.connectionState$.next(OdinConnectionState.error);
    }
  }

  /**
   * Handle all room events
   * @param room
   */
  roomHandler(room: OdinRoom) {
    // Handles the state of the OdinRoom connection
    room.addEventListener('ConnectionStateChanged', (connectionState) => {
      const state = connectionState.payload.newState;
      this.connectionState$.next(state);
    });
    // Handles whenever a OdinPeer joins the room
    room.addEventListener('PeerJoined', (peerJoinedEvent) => {
      const peer = peerJoinedEvent.payload.peer;
      this.peers.set(peer.id, peer);
      this.peers$.next(this.peers);
    });
    // Handles whenever a OdinPeer leaves the room
    room.addEventListener('PeerLeft', (peerLeftEvent) => {
      const peer = peerLeftEvent.payload.peer;
      this.peers.delete(peer.id);
      this.peers$.next(this.peers);
    });
    // Handles whenever a Media in the room gets started.
    room.addEventListener('MediaStarted', ( mediaStarted ) => {
      // Starts the Media to either be able to talk (on own media) or to listen (on remote media).
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

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TokenGenerator } from '@4players/odin-tokens';
import {
  OdinClient,
  OdinConnectionState,
  OdinPeer,
  OdinRoom,
  valueToUint8Array,
} from '@4players/odin';

@Injectable({
  providedIn: 'root',
})
/**
 * The OdinService manages for example the connection, the OdinRoom and the OdinPeers.
 */
export class OdinService {
  /**
   * Stores the underlying OdinRoom instance.
   */
  room!: OdinRoom;

  /**
   * Holds the OdinPeers that are in the room.
   */
  peers: Map<number, OdinPeer> = new Map();

  /**
   * Emits the OdinPeers that are in the room (For Component updates for example).
   */
  peers$: BehaviorSubject<Map<number, OdinPeer>> = new BehaviorSubject<
    Map<number, OdinPeer>
  >(this.peers);

  /**
   * Emits the connection state of the OdinRoom.
   */
  connectionState$ = new BehaviorSubject<OdinConnectionState>('disconnected');

  /**
   * Connects to an OdinRoom with the locally generated access Key.
   * IMPORTANT: The token is generated locally ONLY for testing purpose. In a real world application, the token is provided from a server.
   *
   * @param accessKey
   * @param roomName
   * @param userName
   */
  async connect(accessKey: string, roomName: string, userName: string) {
    if (!accessKey) {
      throw new Error('Please provide an access key!');
    }

    // Generate a token using the specified access key.
    const tokenGenerator = new TokenGenerator(accessKey);
    const token = tokenGenerator.createToken(roomName, userName);

    try {
      // Initialize the OdinRoom instance.
      this.room = await OdinClient.initRoom(token);

      // Add event handlers for the OdinRoom before joining.
      // This makes it possible to fetch Peers that were already in the room before.
      this.roomHandler(this.room);

      // Join the room and pass custom user data (in this case a username).
      const userData = valueToUint8Array(userName);
      await this.room.join(userData);

      // Fetch the MediaStream for the default input device and create an OdinMedia.
      // The own OdinMedia takes care of encoding and transmitting voice data to the ODIN server.
      // IMPORTANT: To be able to speak, the own OdinMedia has to get started (this happens in this.roomHandler()).
      this.getDefaultMediaStream().then((ms) => {
        this.room.createMedia(ms);
      });
    } catch (e) {
      // Emits the OdinConnectionState to error.
      this.connectionState$.next('error');
    }
  }

  /**
   * Handle all room events.
   *
   * @param room
   */
  roomHandler(room: OdinRoom) {
    // Handle changes of the OdinRoom connection state.
    room.addEventListener(
      'ConnectionStateChanged',
      (connectionStateChangedEvent) => {
        const state = connectionStateChangedEvent.payload.newState;
        this.connectionState$.next(state);
      }
    );

    // Handle peers joining the room.
    room.addEventListener('PeerJoined', (peerJoinedEvent) => {
      const peer = peerJoinedEvent.payload.peer;
      this.peers.set(peer.id, peer);
      this.peers$.next(this.peers);
    });

    // Handle peers leaving the room.
    room.addEventListener('PeerLeft', (peerLeftEvent) => {
      const peer = peerLeftEvent.payload.peer;
      this.peers.delete(peer.id);
      this.peers$.next(this.peers);
    });

    // Handle medias in the room getting started.
    room.addEventListener('MediaStarted', (mediaStartedEvent) => {
      // Start the media to either be able to talk (on own media) or to listen (on remote media).
      mediaStartedEvent.payload.media.start().then();
    });

    // Handle medias in the room getting started.
    room.addEventListener('MediaStopped', (mediaStoppedEvent) => {
      // Stop the Media to either stop sending voice data (on own media) or to mute others (on remote media).
      mediaStoppedEvent.payload.media.stop().then();
    });
  }

  /**
   * Disconnect the OdinClient and its rooms.
   */
  disconnect() {
    OdinClient.disconnect();
    this.peers$.next(new Map());
  }

  /**
   * Get the MediaStream for the default device.
   */
  getDefaultMediaStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true,
        sampleRate: 48000,
      },
    });
  }
}

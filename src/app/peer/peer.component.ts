import { Component, Input, OnInit } from '@angular/core';
import { OdinPeer, uint8ArrayToValue } from '@4players/odin';

@Component({
  selector: 'app-peer',
  templateUrl: './peer.component.html',
  styleUrls: ['./peer.component.scss'],
})
/**
 * Renders an OdinPeer.
 */
export class PeerComponent implements OnInit {
  /**
   * Holds the peer that gets rendered.
   */
  @Input() peer!: OdinPeer;

  /**
   * Holds the CSS class for talk status.
   */
  talkStatus: 'talking' | '' = '';

  /**
   * Holds the username if there is one.
   */
  userName: string = '';

  ngOnInit(): void {
    // Decode the peer user data to get the username.
    this.userName = uint8ArrayToValue(this.peer.data) as string;

    // Subscribe to the MediaActivity event to see if a peer is talking.
    this.peer.addEventListener('MediaActivity', (activity) => {
      if (activity.payload.media.active) {
        this.talkStatus = 'talking';
      } else {
        this.talkStatus = '';
      }
    });
  }
}

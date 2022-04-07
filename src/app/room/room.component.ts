import { Component, OnDestroy, OnInit } from '@angular/core';
import { OdinService } from '../services/odin.service';
import { OdinConnectionState, OdinPeer } from '@4players/odin';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
/**
 * Renders an OdinRoom.
 */
export class RoomComponent implements OnInit, OnDestroy {
  /**
   * Holds the current state of the connection.
   */
  connectionState: OdinConnectionState = 'disconnected';

  /**
   * Stores an error message if available.
   */
  error!: string;

  /**
   * Holds active subscriptions to unsubscribe them when the room gets destroyed.
   */
  subscriptions = new Subscription();

  /**
   * Holds the CSS class how content should get displayed.
   */
  displayContent: 'fold' | 'expand' = 'fold';

  /**
   * Holds the peers that are currently in the room.
   */
  peers: Map<number, OdinPeer> = new Map();

  constructor(public odinService: OdinService) {}

  ngOnInit(): void {
    // Handle component state depending on the connection state.
    this.subscriptions.add(
      this.odinService.connectionState$.subscribe((state) => {
        this.connectionState = state;
        switch (state) {
          case 'error': {
            this.error = 'An error occurred :(';
            this.connectionState = state;
            break;
          }
          case 'connected': {
            this.displayContent = 'expand';
            break;
          }
          case 'disconnected': {
            this.displayContent = 'fold';
          }
        }
      })
    );

    // Subscribe to the peers$ observable to sync them.
    this.subscriptions.add(
      this.odinService.peers$.subscribe((peers) => {
        this.peers = peers;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

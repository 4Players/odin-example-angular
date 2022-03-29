import {Component, OnDestroy, OnInit} from '@angular/core';
import {OdinService} from "../services/odin.service";
import {OdinConnectionState, OdinPeer} from "@4players/odin";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
/**
 * Renders an OdinRoom
 */
export class RoomComponent implements OnInit, OnDestroy {
  /** Current state of the connection */
  connectionState: OdinConnectionState = 0;
  /** If there is an error, holds it */
  error: string |undefined = undefined;
  /** Holds active subscriptions to unsubscribe them when the room gets destroyed */
  subscriptions = new Subscription();
  /** CSS class how content should get displayed */
  displayContent: 'fold' | 'expand' = 'fold';
  /** Holds the peers that are currently in the room */
  peers: Map<number, OdinPeer> = new Map();

  constructor(public odinService: OdinService) { }

  ngOnInit(): void {
    /**
     * Handles some Component state depending on the connection state.
     */
    this.subscriptions.add(this.odinService.connectionState$.subscribe( state => {
      this.connectionState = state;
      switch (state) {
        case OdinConnectionState.error: {
          this.error = 'An Error happened :(';
          this.connectionState = state;
          break;
        }
        case OdinConnectionState.connected: {
          this.displayContent = 'expand';
          break;
        }
        case OdinConnectionState.disconnected: {
          this.displayContent = 'fold';
        }
      }
    }));
    /**
     * Subscribes to the peers$ Observable to synch them.
     */
    this.subscriptions.add(this.odinService.peers$.subscribe( peers => {
      this.peers = peers;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

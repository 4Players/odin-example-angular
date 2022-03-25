import {Component, OnInit} from '@angular/core';
import {OdinService} from "../services/odin.service";
import {OdinConnectionState, OdinPeer} from "@4players/odin";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  connectionState: OdinConnectionState = 0;
  error: string |undefined = undefined;
  subscriptions = new Subscription();
  displayContent: 'fold' | 'expand' = 'fold';
  peers: Map<number, OdinPeer> = new Map();

  constructor(public odinService: OdinService) { }

  ngOnInit(): void {
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
    this.subscriptions.add(this.odinService.peers$.subscribe( peers => {
      this.peers = peers;
    }));
  }
}

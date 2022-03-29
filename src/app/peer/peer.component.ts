import {Component, Input, OnInit} from '@angular/core';
import {OdinPeer} from "@4players/odin";
import {OdinService} from "../services/odin.service";

@Component({
  selector: 'app-peer',
  templateUrl: './peer.component.html',
  styleUrls: ['./peer.component.scss']
})
/**
 * Renders an OdinPeer
 */
export class PeerComponent implements OnInit {

  /** Holds the peer that gets rendered */
  @Input() peer!: OdinPeer;
  /** CSS class for talk status */
  talkStatus: 'talking' | ''  = '';
  /** Holds the username if there is on e*/
  userName = '';

  constructor(private odinService: OdinService) { }

  ngOnInit(): void {
    // Decode the OdinPeer.data to get the userName
    this.userName = this.odinService.byteArrayToString(this.peer.data);
    /**
     * Subscribes to the MediaActivity to see if a peer is talking.
     */
    this.peer.addEventListener('MediaActivity', ( activity ) => {
      if (activity.payload.media.active) {
        this.talkStatus = 'talking';
      } else {
        this.talkStatus = '';
      }
    });
  }
}

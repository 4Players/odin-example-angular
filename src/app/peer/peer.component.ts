import {Component, Input, OnInit} from '@angular/core';
import {OdinPeer} from "@4players/odin";
import {OdinService} from "../services/odin.service";

@Component({
  selector: 'app-peer',
  templateUrl: './peer.component.html',
  styleUrls: ['./peer.component.scss']
})
export class PeerComponent implements OnInit {

  @Input() peer!: OdinPeer;
  talkStatus: 'talking' | ''  = '';
  userName = '';

  constructor(private odinService: OdinService) { }

  ngOnInit(): void {
    this.userName = this.odinService.byteArrayToString(this.peer.data);
    this.peer.addEventListener('MediaActivity', ( activity ) => {
      if (activity.payload.media.active) {
        this.talkStatus = 'talking';
      } else {
        this.talkStatus = '';
      }
    });
  }
}

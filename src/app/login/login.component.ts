import {Component, OnDestroy, OnInit} from '@angular/core';
import {OdinService} from "../services/odin.service";
import {Subscription} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {generateAccessKey} from '@4players/odin-tokens';
import {OdinConnectionState} from "@4players/odin";
import {Clipboard} from "@angular/cdk/clipboard";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  connectionState: OdinConnectionState = OdinConnectionState.disconnected;
  error: boolean = false;
  subscriptions = new Subscription();
  accessKey = '';
  displayContent: 'fold' | 'expand' = 'expand';
  loginForm = new FormGroup({
    accessKeyControl: new FormControl(this.accessKey, [
      Validators.minLength(20),
      Validators.required
    ]),
    roomNameControl: new FormControl('Random', []),
    userNameControl: new FormControl('', []),
  });

  constructor(public odinService: OdinService, private clipboard: Clipboard) {
  }

  ngOnInit(): void {
    this.subscriptions.add(this.odinService.connectionState$.subscribe(state => {
      if (state === OdinConnectionState.error) {
        this.error = true;
        this.connectionState = state;
      } else {
        this.connectionState = state;
        if (state === OdinConnectionState.connected) {
          this.displayContent = 'fold';
        }
        if (state === OdinConnectionState.disconnected) {
          this.displayContent = 'expand';
        }
      }
    }));
  }

  /**
   * For Testing purpose, create an access key locally.
   */
  generateAccessKey() {
    this.accessKey =  generateAccessKey();
    this.loginForm.patchValue({accessKeyControl: this.accessKey});
  }

  /**
   * Connect to the OdinRoom.
   */
  async connect() {
    const accessKey = this.loginForm.get('accessKeyControl')?.value;
    const roomName = this.loginForm.get('roomNameControl')?.value;
    const userName = this.loginForm.get('userNameControl')?.value;
    await this.odinService.connect(accessKey, roomName, userName);
  }

  disconnect() {
    this.odinService.disconnect();
  }

  async copyKey() {
    this.clipboard.copy(this.accessKey);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

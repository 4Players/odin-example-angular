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
/**
 * Renders the Login
 */
export class LoginComponent implements OnInit, OnDestroy {
  /** Current state of the connection */
  connectionState: OdinConnectionState = OdinConnectionState.disconnected;
  /** If there is an error, holds it */
  error: boolean = false;
  /** Holds active subscriptions to unsubscribe them when the room gets destroyed */
  subscriptions = new Subscription();
  /** Holds the access key after it was set */
  accessKey = '';
  /** CSS Class for rendering */
  displayContent: 'fold' | 'expand' = 'expand';
  /** Login Form */
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
    /**
     * Handles some Component state depending on the connection state.
     */
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

  /**
   * Disconnects the room.
   */
  disconnect() {
    this.odinService.disconnect();
  }

  /**
   * Copy the access Key to the clipboard to share it.
   */
  async copyKey() {
    this.clipboard.copy(this.accessKey);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

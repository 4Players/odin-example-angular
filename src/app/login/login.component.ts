import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { generateAccessKey } from '@4players/odin-tokens';
import { OdinConnectionState } from '@4players/odin';
import { Subscription } from 'rxjs';

import { OdinService } from '../services/odin.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
/**
 * Renders the login form.
 */
export class LoginComponent implements OnInit, OnDestroy {
  /**
   * Stores the current state of the connection.
   */
  connectionState: OdinConnectionState = 'disconnected';

  /**
   * Indicates whether or not an error occurred.
   */
  error: boolean = false;

  /**
   * Holds active subscriptions to unsubscribe them when the room gets destroyed.
   */
  subscriptions: Subscription = new Subscription();

  /**
   * Holds the access key after it was set.
   */
  accessKey: string = '';

  /**
   * Holds the CSS Class for rendering.
   */
  displayContent: 'fold' | 'expand' = 'expand';

  /**
   * Holds the login form group.
   */
  loginForm = new FormGroup({
    accessKeyControl: new FormControl(this.accessKey, [
      Validators.minLength(44),
      Validators.maxLength(44),
      Validators.required,
    ]),
    roomNameControl: new FormControl('Random', []),
    userNameControl: new FormControl('', []),
  });

  constructor(public odinService: OdinService, private clipboard: Clipboard) {}

  ngOnInit(): void {
    // Handle component state depending on the connection state.
    this.subscriptions.add(
      this.odinService.connectionState$.subscribe((state) => {
        this.error = state === 'error';
        this.connectionState = state;

        if (!this.error) {
          if (state === 'connected') {
            this.displayContent = 'fold';
          }
          if (state === 'disconnected') {
            this.displayContent = 'expand';
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Create an access key locally for testing purposes.
   */
  generateAccessKey() {
    this.accessKey = generateAccessKey();

    this.loginForm.patchValue({
      accessKeyControl: this.accessKey,
    });
  }

  /**
   * Connect to the ODIN server and join the room.
   */
  async connect() {
    const accessKey = this.loginForm.get('accessKeyControl')?.value;
    const roomName = this.loginForm.get('roomNameControl')?.value;
    const userName = this.loginForm.get('userNameControl')?.value;

    await this.odinService.connect(accessKey, roomName, userName);
  }

  /**
   * Leave the room and close the connection to the server.
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
}

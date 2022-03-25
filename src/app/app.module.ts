import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatCardModule} from "@angular/material/card";
import { LoginComponent } from './login/login.component';
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import { RoomComponent } from './room/room.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { PeerComponent } from './peer/peer.component';
import {Clipboard} from "@angular/cdk/clipboard";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RoomComponent,
    PeerComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule
    ],
  providers: [Clipboard],
  bootstrap: [AppComponent]
})
export class AppModule { }

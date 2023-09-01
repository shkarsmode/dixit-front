import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { GreetingComponent } from './components/greeting/greeting.component';
import { PendingComponent } from './components/pending/pending.component';
import { RoomComponent } from './components/room/room.component';
import { CardComponent } from './features/card/card.component';
import { CustomCursorComponent } from './features/custom-cursor/custom-cursor.component';
import { DeskComponent } from './features/desk/desk.component';
import { HandComponent } from './features/hand/hand.component';
import { RoomUsersComponent } from './features/room-users/room-users.component';
import { ChangeUsernameComponent } from './shared/dialogs/change-username/change-username.component';
import { ActiveCursorDirective } from './shared/directives/active-cursor.directive';
import { HeaderInterceptor } from './shared/helpers/header.interceptor';
import { MaterialModule } from './shared/modules/materials/material.module';
import { SocketModule } from './shared/modules/socket-io/socket-io.module';

@NgModule({
    declarations: [
        AppComponent,
        RoomComponent,
        AdminPanelComponent,
        PendingComponent,
        CardComponent,
        HandComponent,
        GreetingComponent,
        CustomCursorComponent,
        ActiveCursorDirective,
        RoomUsersComponent,
        DeskComponent,
        ChangeUsernameComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SocketModule,
        FormsModule,
        MaterialModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

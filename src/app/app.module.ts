import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ChangeUsernameComponent } from '@shared/dialogs';
import { CustomCursorComponent } from '@shared/features';
import { HeaderInterceptor } from '@shared/helpers';
import { SocketModule } from '@shared/modules';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SocketModule,
        ComponentsModule,
        CustomCursorComponent,
        ChangeUsernameComponent
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

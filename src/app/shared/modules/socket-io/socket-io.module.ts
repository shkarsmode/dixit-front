import { NgModule } from '@angular/core';

import { SocketIoConfig, SocketIoModule as SoketModule } from 'ngx-socket-io';

const config: SocketIoConfig = { 
    url: 'https://0dbc-188-230-92-12.ngrok-free.app', 
    options: {
        withCredentials: true,
        transports: ['websocket'],
        extraHeaders: {
            'ngrok-skip-browser-warning': '69420',
        },
    },
};


@NgModule({
    imports: [
        SoketModule.forRoot(config),
    ],
    exports: [
        SoketModule
    ]
})
export class SocketModule { }

import { NgModule } from '@angular/core';

import { SocketIoConfig, SocketIoModule as SoketModule } from 'ngx-socket-io';

const config: SocketIoConfig = { 
    url: 'https://dixit-back.vercel.app', 
    options: {
        withCredentials: true,
        transports: ['websocket']
    }
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

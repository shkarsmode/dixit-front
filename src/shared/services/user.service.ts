import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { IUser } from '../interfaces/IUser';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    public user: IUser;

    constructor(
        public socket: Socket,
    ) {
        const id = this.generateIdForUser();
        socket.ioSocket.io.opts.query = { 
            username: 'username-' + id.slice(-2, -1), // for test
            id
        };
        socket.connect();
    }

    public generateIdForUser(): string {
        this.socket.disconnect();
        
        // * for production
        // const userId = localStorage.getItem('userId');
        // if (userId) return userId;

        const timestamp = Date.now().toString();
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        const id = timestamp + randomNum;

        // * for production
        // localStorage.setItem('userId', id); 
        return id;
    }
}

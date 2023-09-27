import { Injectable } from '@angular/core';
import { IUser } from '@shared/interfaces';
import { Socket } from 'ngx-socket-io';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    public user: IUser;

    constructor(
        public socket: Socket,
    ) {
        const id = this.generateIdForUser(); // replace on id from token in future
        const username = localStorage.getItem('username'); // maxlength 13
        
        socket.ioSocket.io.opts.query = { 
            username: username ? username : 'username-' + id.slice(-2, -1),
            id
        };
        socket.connect();
    }

    public generateIdForUser(): string {
        this.socket.disconnect();
        
        // * for production
        const userId = localStorage.getItem('userId');
        if (userId) return userId;

        const timestamp = Date.now().toString();
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        const id = timestamp + randomNum;

        // * for production
        localStorage.setItem('userId', id); 
        return id;
    }

    public setCurrentUser(users: IUser[]): void {
        const userId = localStorage.getItem('userId');
        this.user = users.find(user => user.id === userId)!;
    }

    public changeUserName(roomCode: string, username: string): void {
        this.socket.emit(
            'changeUsername',
            [roomCode, username]
        );
    }
}

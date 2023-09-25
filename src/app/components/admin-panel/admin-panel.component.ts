import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';
import { ServerEvents } from 'src/app/shared/interfaces/server-events.enum';

@Component({
    selector: 'app-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit, OnDestroy {

    public roomCode: string;
    public subscriptions: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private socket: Socket
    ) {}

    public ngOnInit(): void {
        this.subscibeOnRoomCodeChange();
    }
    
    public startGame(): void {
        this.socket.emit(ServerEvents.StartGame, this.roomCode);
    }

    private subscibeOnRoomCodeChange(): void {
        const sub = 
            this.route.params.subscribe(params => this.roomCode = params['roomCode']);

        this.subscriptions.push(sub);
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

}

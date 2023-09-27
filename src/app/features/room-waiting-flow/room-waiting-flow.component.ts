import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-room-waiting-flow',
    templateUrl: './room-waiting-flow.component.html',
    styleUrls: ['./room-waiting-flow.component.scss'],
})
export class RoomWaitingFlowComponent {
    @Input() roomCode: string;
    @Input() countOfUsers: number;
    @Output() leaveRoom: EventEmitter<void> = new EventEmitter();

    public leave = () => this.leaveRoom.emit();
}

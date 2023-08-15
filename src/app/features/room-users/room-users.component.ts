import { Component, Input } from '@angular/core';
import { IUser } from 'src/shared/interfaces/IUser';

@Component({
    selector: 'app-room-users',
    templateUrl: './room-users.component.html',
    styleUrls: ['./room-users.component.scss']
})
export class RoomUsersComponent {
    
    @Input() public users: IUser[];
}

import { Component, Input, OnInit } from '@angular/core';
import { IUser } from '@shared/interfaces';

@Component({
    selector: 'app-room-users',
    templateUrl: './room-users.component.html',
    styleUrls: ['./room-users.component.scss'],
})
export class RoomUsersComponent implements OnInit {
    @Input() public users: IUser[];
    @Input() public isResults: boolean = false;

    public isShowLeaderBoard: boolean = true;

    public ngOnInit(): void {
        this.hideShowLeaderBoardIfScreenLower700px();
    }

    private hideShowLeaderBoardIfScreenLower700px(): void {
        this.isShowLeaderBoard = window.innerWidth > 700;
        console.log(this.isShowLeaderBoard);
    }

    public get indexOfUserHeader(): number {
        return this.users.findIndex((user) => user.isHeader);
    }

    public toggleLeaderboard(): void {
        this.isShowLeaderBoard = !this.isShowLeaderBoard;
    }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeUsernameComponent } from '@shared/dialogs';
import { IResults, IUser, ServerEvents, States } from '@shared/interfaces';
import { DeskService, UserService } from '@shared/services';
import { Socket } from 'ngx-socket-io';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit, OnDestroy {
    public isAdmin: boolean = false;

    public statesEnum: typeof States = States;
    public state: States = States.NotStarted;
    public States: typeof States = States;

    public roomCode: string = '';
    public myCardOnTheDeck: string = '';
    public association: string = '';
    public countOfUsers: number;

    public cardsOnTheDesk: string[] = [];
    public cardsForBack: string[] = [];
    public handCards: string[] = [];
    public results: IResults = [];

    public usersScore: Array<[string, number]>;
    public users: IUser[];

    private isJoinedToRoom: boolean = false;
    private socket: Socket;
    private dialogConfig: MatDialogConfig = new MatDialogConfig();
    private destroy$: Subject<void> = new Subject();

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly deskService: DeskService,
        private readonly userService: UserService,
        private readonly dialog: MatDialog
    ) {
        this.socket = userService.socket;
    }

    public ngOnInit(): void {
        this.subscribeOnCountOfUsers();
        this.subscribeOnChangeState();
        this.subscribeOnGiveCardsForHand();
        this.subscibeOnRoomCodeChange();
        this.subscribeOnAssociation();
        this.subscibeOnCardsForTheDesk();
        this.subscribeOnChangeScore();
        this.subscribeOnUsers();
        this.subscribeOnVotingResults();
        this.subscribeOnGiveOneCard();
        this.subscribeOnGiveMyCardOnTheDesk();
        this.showControlPanelIfUserAdmin();
        this.subscribeOnPingConnection();
        this.initDialogConfig();
        this.checkIsUserDoesntHasName();
    }

    private subscribeOnPingConnection(): void {
        this.socket
            .fromEvent<string>(ServerEvents.ConnectedToServer)
            .pipe(takeUntil(this.destroy$))
            .subscribe((userId: string) => {
                if (this.roomCode) {
                    this.joinRoom();
                }
            });
    }

    private checkIsUserDoesntHasName(): void {
        const username = localStorage.getItem('username');
        if (username) {
            if (username.length > 13) this.openDialogToChangeUserName();

            return;
        }

        this.openDialogToChangeUserName();
    }

    private subscibeOnRoomCodeChange(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            const roomCode = params['roomCode'];
            this.handleChangedRoomCode(roomCode);
        });
    }

    private subscribeOnChangeScore(): void {
        this.socket
            .fromEvent<Map<string, number>>(ServerEvents.ChangeScore)
            .pipe(takeUntil(this.destroy$))
            .subscribe((usersScore: Map<string, number>) => {
                for (const userScore of usersScore) {
                    this.usersScore.push([userScore[0], userScore[1]]);
                }
            });
    }

    private subscribeOnUsers(): void {
        this.socket
            .fromEvent<IUser[]>(ServerEvents.Users)
            .pipe(takeUntil(this.destroy$))
            .subscribe((users: IUser[]) => {
                this.users = users;
                this.userService.setCurrentUser(this.users);
            });
    }

    private subscribeOnVotingResults(): void {
        this.socket
            .fromEvent<IResults>(ServerEvents.VotingResults)
            .pipe(takeUntil(this.destroy$))
            .subscribe((results: IResults) => {
                this.results = results;
            });
    }

    private subscibeOnCardsForTheDesk(): void {
        this.socket
            .fromEvent<string>(ServerEvents.CardForTheDesk)
            .pipe(takeUntil(this.destroy$))
            .subscribe((card: string) => {
                if (this.handCards.indexOf(card) !== -1) {
                    this.handCards = this.handCards.filter(
                        (handCard) => handCard !== card
                    );
                }
                this.cardsForBack = [...this.cardsForBack, 'card'];
                this.cardsOnTheDesk = [...this.cardsOnTheDesk, card];
                this.shuffleCards();
            });
    }

    private shuffleCards() {
        for (let i = this.cardsOnTheDesk.length - 1; i > 0; i--) {
            const randomIndex = this.getRandomIndex(i + 1);
            [this.cardsOnTheDesk[i], this.cardsOnTheDesk[randomIndex]] = [
                this.cardsOnTheDesk[randomIndex],
                this.cardsOnTheDesk[i],
            ];
        }
    }

    private getRandomIndex(max: number): number {
        return Math.floor(Math.random() * max);
    }

    private handleChangedRoomCode(roomCode: string): void {
        if (!roomCode) {
            console.log('No room code');
            this.router.navigate(['/']);
            return;
        }

        this.roomCode = roomCode;
        this.joinRoom();
    }

    private joinRoom(): void {
        if (this.isJoinedToRoom) return;
        this.isJoinedToRoom = true;

        this.socket.emit(
            ServerEvents.JoinRoom,
            this.roomCode,
            (user: IUser) => {
                if (!user) {
                    console.log('No room was found');
                    this.router.navigate(['/']);
                    return;
                }
                this.userService.user = user;
            }
        );
    }

    private subscribeOnCountOfUsers(): void {
        this.socket
            .fromEvent<number>(ServerEvents.CountOfUsers)
            .pipe(takeUntil(this.destroy$))
            .subscribe((count: number) => (this.countOfUsers = count));
    }

    private subscribeOnChangeState(): void {
        this.socket
            .fromEvent<States>(ServerEvents.ChangeState)
            .pipe(takeUntil(this.destroy$))
            .subscribe(this.handleStateChange.bind(this));
    }

    private subscribeOnAssociation(): void {
        this.socket
            .fromEvent<string>(ServerEvents.Association)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (association: string) => (this.association = association)
            );
    }

    private handleStateChange(state: States): void {
        this.state = state;

        switch (this.state) {
            case States.ChooseCardAsHeader:
            case States.WaitForHeader:
                this.resetVariables();
        }
    }

    private subscribeOnGiveCardsForHand(): void {
        this.socket
            .fromEvent<string[]>(ServerEvents.HandCards)
            .pipe(takeUntil(this.destroy$))
            .subscribe((cards: string[]) => (this.handCards = cards));
    }

    private subscribeOnGiveOneCard(): void {
        this.socket
            .fromEvent<string>(ServerEvents.OneCard)
            .pipe(takeUntil(this.destroy$))
            .subscribe((card: string) => this.handCards.push(card));
    }

    private subscribeOnGiveMyCardOnTheDesk(): void {
        this.socket
            .fromEvent<string>(ServerEvents.MyCardOnTheDesk)
            .pipe(takeUntil(this.destroy$))
            .subscribe((card: string) => (this.myCardOnTheDeck = card));
    }

    public chooseCard(card: string): void {
        if (!this.association) return;

        switch (this.state) {
            case States.ChooseCardAsHeader: {
                this.socket.emit(
                    ServerEvents.ChooseCardAsAHeader,
                    this.roomCode,
                    card,
                    this.association
                );
                break;
            }
            case States.ChooseCard: {
                this.socket.emit(
                    ServerEvents.ChooseCardAsAUser,
                    this.roomCode,
                    card
                );
                this.myCardOnTheDeck = card;
                break;
            }
        }
    }

    private resetVariables(): void {
        this.association = '';
        this.myCardOnTheDeck = '';
        this.cardsOnTheDesk = [];
        this.cardsForBack = [];
        this.results = [];
        this.deskService.emitNewRound();
    }

    public associationChanged(association: string): void {
        this.association = association;
    }

    public get isPutDownHand(): boolean {
        switch (this.state) {
            case States.ShowCardsForHeader:
            case States.ShowCardsAndVoting:
            case States.Results:
                return true;
            default:
                return false;
        }
    }

    public voteForThisCard(card: string): void {
        if (
            States.ShowCardsAndVoting === this.state &&
            card !== this.myCardOnTheDeck
        ) {
            this.socket.emit(ServerEvents.VoteForTheCard, this.roomCode, card);
        }
    }

    public moveToNextRound(): void {
        this.socket.emit(ServerEvents.MoveToNextRound, this.roomCode);
    }

    public leaveRoom(): void {
        this.socket.emit(ServerEvents.LeaveRoom, this.roomCode);
        this.router.navigate(['/']);
    }

    // * Dialog Change username functions * //

    private showControlPanelIfUserAdmin(): void {
        const isAdmin = !!localStorage.getItem('isAdmin');
        if (isAdmin) this.isAdmin = isAdmin;
    }

    private initDialogConfig(): void {
        this.dialogConfig.autoFocus = false;
        this.dialogConfig.maxWidth = '550px';
        this.dialogConfig.width = '90%';
        this.dialogConfig.height = '350px';
        this.dialogConfig.disableClose = true;
    }

    private openDialogToChangeUserName(): void {
        this.dialog.open(ChangeUsernameComponent, {
            ...this.dialogConfig,
            data: this.roomCode,
        });
    }

    // * END Dialog Change username functions * //

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}

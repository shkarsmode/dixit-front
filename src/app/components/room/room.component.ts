import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';
import { ChangeUsernameComponent } from 'src/app/shared/dialogs/change-username/change-username.component';
import { IResults } from 'src/app/shared/interfaces/IResults';
import { IUser } from 'src/app/shared/interfaces/IUser';
import { States } from 'src/app/shared/interfaces/states.enum';
import { DeskService } from 'src/app/shared/services/desk.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent {
    
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

    private socket: Socket;
    private dialogConfig: MatDialogConfig = new MatDialogConfig();
    private subscriptions: Subscription[] = [];
    

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private deskService: DeskService,
        private userService: UserService,
        private dialog: MatDialog
    ) {
        this.socket = userService.socket;
    }

    public ngOnInit(): void {
        this.subscribeOnCountOfUsers();
        this.subscribeOnChangeState();
        this.subscribeOnGiveCards();
        this.subscibeOnRoomCodeChange();
        this.subscribeOnAssociation();
        this.subscibeOnCardsForTheDesk();
        this.subscribeOnChangeScore();
        this.subscribeOnUsers();
        this.subscribeOnVotingResults();
        this.subscribeOnGiveOneCard();
        this.subscribeOnGiveMyCardOnTheDesk();
        this.showControlPanelIfUserAdmin();
        this.initDialogConfig();
        this.checkIsUserDoesntHasName();
    }

    private checkIsUserDoesntHasName(): void {
        const username = localStorage.getItem('username');
        if (username) {
            if (username.length > 13)
                this.openDialogToChangeUserName();
            
            return;
        }
        
        this.openDialogToChangeUserName();
    }

    private subscibeOnRoomCodeChange(): void {
        const sub = 
            this.route.params.subscribe(params => {
                const roomCode = params['roomCode'];
                this.handleChangedRoomCode(roomCode);
            });

        this.subscriptions.push(sub);
    }

    private subscribeOnChangeScore(): void {
        const sub = 
            this.socket.fromEvent<Map<string, number>>('changeScore')
                .subscribe((usersScore: Map<string, number>) => {
                    for (const userScore of usersScore) {
                        this.usersScore.push([userScore[0], userScore[1]]);
                    }
                });

        this.subscriptions.push(sub);
    }

    private subscribeOnUsers(): void {
        const sub = 
            this.socket.fromEvent<IUser[]>('users')
                .subscribe((users: IUser[]) => {
                    this.users = users;
                    this.userService.setCurrentUser(this.users);
                });

        this.subscriptions.push(sub)
    }

    
    private subscribeOnVotingResults(): void {
        const sub = 
            this.socket.fromEvent<IResults>('votingResults')
                .subscribe((results: IResults) => {
                    this.results = results;
                    console.log('results', results);
                });

        this.subscriptions.push(sub)
    }
    
    private subscibeOnCardsForTheDesk(): void {
        const sub = 
            this.socket.fromEvent<string>('cardForTheDesk')
                .subscribe((card: string) => {
                    if (this.handCards.indexOf(card) !== -1) {
                        // * A bit later add some animation here
                        this.handCards = this.handCards.filter(handCard => handCard !== card);
                    }
                    this.cardsForBack.push(card);
                    this.cardsOnTheDesk.push(card);
                    this.shuffleCards();
                });

        this.subscriptions.push(sub);
    }

    private shuffleCards() {
        for (let i = this.cardsOnTheDesk.length - 1; i > 0; i--) {
            const randomIndex = this.getRandomIndex(i + 1);
            [this.cardsOnTheDesk[i], this.cardsOnTheDesk[randomIndex]] = 
                [this.cardsOnTheDesk[randomIndex], this.cardsOnTheDesk[i]];
        }
    }

    private getRandomIndex(max: number) {
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
        this.socket.emit(
            'joinRoom', 
            this.roomCode,
            (user: IUser) => {
                console.log(user);
                if (!user) {
                    console.log('No room was found');
                    this.router.navigate(['/']);
                    return;
                }
                this.userService.user = user;
            });
    }

    private subscribeOnCountOfUsers(): void {
        const sub = 
            this.socket.fromEvent<number>('joinRoom')
                .subscribe((count: number) => this.countOfUsers = count);

        this.subscriptions.push(sub);
    }

    private subscribeOnChangeState(): void {
        const sub = 
            this.socket.fromEvent<States>('changeState')
                .subscribe(this.handleStateChange.bind(this));

        this.subscriptions.push(sub);
    }

    private subscribeOnAssociation(): void {
        const sub = 
            this.socket.fromEvent<string>('association')
                .subscribe((association: string) => {
                    console.log(association);
                    this.association = association
                });

        this.subscriptions.push(sub);
    }

    private handleStateChange(state: States): void {
        this.state = state;

        switch(this.state) {
            case States.ChooseCardAsHeader:
            case States.WaitForHeader: {
                this.resetVariables();
                console.log("RESET VARIABLES");
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

    private subscribeOnGiveCards(): void {
        const sub = 
            this.socket.fromEvent<string[]>('giveCards')
                .subscribe((cards: string[]) => this.handCards = cards);
                
        this.subscriptions.push(sub);
    }

    private subscribeOnGiveOneCard(): void {
        const sub = 
            this.socket.fromEvent<string>('giveOneCard')
                .subscribe((card: string) => this.handCards.push(card));
                
        this.subscriptions.push(sub);
    }

    private subscribeOnGiveMyCardOnTheDesk(): void {
        const sub = 
            this.socket.fromEvent<string>('myCardOnTheDesk')
                .subscribe((card: string) => {
                    this.myCardOnTheDeck = card;
                    console.log('myCardOnTheDeck', this.myCardOnTheDeck)
                });
                
        this.subscriptions.push(sub);
    }

    public chooseCard(card: string): void {
        if (!this.association) return;

        switch(this.state) {
            case States.ChooseCardAsHeader: {
                this.socket.emit('chooseCardAsAHeader', this.roomCode, card, this.association);
                break;
            };
            case States.ChooseCard: {
                this.socket.emit('chooseCardAsAUser', this.roomCode, card);
                this.myCardOnTheDeck = card;
                break;
            };
        }
    }

    public get isPutDownHand(): boolean {
        switch(this.state) {
            case States.ShowCardsForHeader:
            case States.ShowCardsAndVoting:
            case States.Results:
                return true;
            default: return false;
        }
    }

    public voteForThisCard(card: string): void {
        if (
            States.ShowCardsAndVoting === this.state && 
            card !== this.myCardOnTheDeck
        ) {
            this.socket.emit('voteForTheCard', this.roomCode, card);
        }
    }

    public moveToNextRound(): void {
        this.socket.emit('moveToNextRound', this.roomCode);
    }

    public leaveRoom(): void {
        this.socket.emit('leaveRoom', this.roomCode);
        this.router.navigate(['/']);
    }

    // * Change username functions * //

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
        this.dialog.open(
            ChangeUsernameComponent, 
            { ...this.dialogConfig, data: this.roomCode }
        );
    }

    // * END Change username functions * //

    public ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}

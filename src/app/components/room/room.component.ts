import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';
import { IResults } from 'src/shared/interfaces/IResults';
import { IUser } from 'src/shared/interfaces/IUser';
import { States } from 'src/shared/interfaces/states.enum';
import { DeskService } from 'src/shared/services/desk.service';
import { UserService } from 'src/shared/services/user.service';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent {

    public roomCode: string;
    public countOfUsers: number;

    public statesEnum: typeof States = States;
    public state: States = States.NotStarted;

    public cardsOnTheDesk: string[] = [];
    public cardsForBack: string[] = [];
    public handCards: string[] = [];
    public results: IResults = [];

    public usersScore: Array<[string, number]>;
    public users: IUser[];

    public subscriptions: Subscription[] = [];

    private socket: Socket;
    

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private deskService: DeskService,
        private userService: UserService
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
    }

    private subscibeOnRoomCodeChange(): void {
        const sub = 
            this.route.params.subscribe(params => {
                const roomCode = params['roomCode'];
                console.log('changed', roomCode);
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
                    console.log('users', users);
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

    public isChooseCardAsAHeader: boolean = false;
    public isChooseCard: boolean = false;
    public association: string = '';
    public isShowCards: boolean = false;
    public isVoting: boolean = false;
    public isResults: boolean = false;
    public isWaitForHeader: boolean = false;

    private handleStateChange(state: States): void {
        this.state = state;
        // this.resetVariables();

        console.log(state);

        switch(this.state) {
            case States.Pending: break;
            case States.ChooseCardAsHeader: {
                this.resetVariables();
                this.isChooseCardAsAHeader = true;
                break;
            };
            case States.WaitForHeader: {
                this.resetVariables();
                this.isWaitForHeader = true;
                break;
            }
            case States.ChooseCard: {
                this.isWaitForHeader = false;
                this.isChooseCard = true;
                break;
            }
            case States.ShowCards: {
                this.isShowCards = true;
                break;
            }
            case States.Voting: {
                this.isShowCards = true;
                this.isVoting = true;
                break;
            }
            case States.Results: {
                this.isShowCards = true;
                this.isResults = true;
                break;
            }
        }
    }

    private resetVariables(): void {
        this.isChooseCardAsAHeader = false;
        this.isWaitForHeader = false;
        this.isChooseCard = false;
        this.isVoting = false;
        this.isResults = false;
        this.isShowCards = false;
        this.association = '';
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

    public chooseCard(card: string): void {
        if (this.isChooseCardAsAHeader && this.association) {
            this.socket.emit('chooseCardAsAHeader', this.roomCode, card, this.association);
            this.isChooseCardAsAHeader = false;
        } else if (this.isChooseCard) {
            this.socket.emit('chooseCardAsAUser', this.roomCode, card);
            this.isChooseCard = false;
            this.myCardOnTheDeck = card;
        }
    }

    public myCardOnTheDeck: string;
    public isVotedCard: boolean = false;
    public voteForThisCard(card: string): void {
        if (this.isVoting && card !== this.myCardOnTheDeck) {
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

    public ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}

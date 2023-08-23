import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { IResults } from 'src/shared/interfaces/IResults';
import { IUser } from 'src/shared/interfaces/IUser';
import { UserService } from 'src/shared/services/user.service';
import { DeskService } from '../../../shared/services/desk.service';

@Component({
    selector: 'app-desk',
    templateUrl: './desk.component.html',
    styleUrls: ['./desk.component.scss']
})
export class DeskComponent implements OnInit, OnDestroy {

    @Input() public cards: string[] = [];
    @Input() public cardsForBack: string[] = [];
    @Input() public results: IResults = [];
    @Input() public users: IUser[] = [];

    @Input() public isShowCards: boolean = false;
    @Input() public isWaitForHeader: boolean = false;
    @Input() public isChooseCard: boolean = false;
    @Input() public isHeader: boolean = false;
    @Input() public isResults: boolean = false;

    @Input() public association: string = '';
    @Input() public myCardOnTheDeck: string = '';

    public isRotateCards: boolean = false;

    @Output() public voteCard: EventEmitter<string> = new EventEmitter();
    @Output() public nextRound: EventEmitter<void> = new EventEmitter();

    
    public readonly pathToDixitCards: string = 'assets/img/dixit/';
    public readonly format: string = '.png';
    public chosenCard: string = '';
    public isEmittedNextRound: boolean = false;

    private subscriptions: Subscription[] = [];

    constructor(
        private deskService: DeskService,
        private userService: UserService
    ) {}

    public ngOnInit(): void {
        this.subscribeOnNewRound();
    }

    public moveToNextRound(): void {
        if (this.isEmittedNextRound) return;

        this.nextRound.emit();
        this.isEmittedNextRound = true;
    }

    public async ngOnChanges(): Promise<void> {
        console.log("ngOnChanges", this.isRotateCards);
        if (this.isShowCards && !this.isRotateCards && !this.isEmittedNextRound) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.isRotateCards = true;
        }
    }

    private subscribeOnNewRound(): void {
        const sub = 
            this.deskService.newRound$
                .subscribe(this.clearVariablesForNewRound.bind(this));

        this.subscriptions.push(sub);
    }

    private clearVariablesForNewRound(): void {
        this.isEmittedNextRound = false;
        this.isRotateCards = false;
        this.isShowCards = false;
    }

    private voteForThisCard(card: string): void {
        if (this.hasMatcheResultsAndUsersLength) return;
        this.markUsersVote(card);
        this.voteCard.emit(card);
    }

    private markUsersVote(card: string): void {
        const color = this.userService.user.color as string;
        const userVote = {
            card,
            votes: [color],
            isHeaderCard: false
        };
        this.results = [userVote];
    }

    public isHeaderCard = (card: string): boolean => {
        if (!this.hasMatcheResultsAndUsersLength) return false;
        return this.results.find(result => result.card === card)!.isHeaderCard
    }

    public onMouseDown(cardElement: HTMLDivElement, card: string): void {
        if (
            this.isHeader || 
            this.hasMatcheResultsAndUsersLength || 
            card === this.myCardOnTheDeck
        ) return;
        
        this.chosenCard = card;
        cardElement.style.transform = 'scale(0.9)';
    }

    public onMouseLeave(cardElement: HTMLDivElement): void {
        if (this.isHeader || this.hasMatcheResultsAndUsersLength) return;
        this.chosenCard = '';
        cardElement.style.transform = 'scale(1)';
    }

    public onMouseUp(cardElement: HTMLDivElement, card: string): void {
        if (
            this.isHeader || 
            this.hasMatcheResultsAndUsersLength || 
            this.chosenCard !== card
        ) return;

        this.chosenCard = '';
        cardElement.style.transform = 'scale(1)';
        this.voteForThisCard(card);
    }

    private get hasMatcheResultsAndUsersLength (): boolean {
        return this.results.length === this.users.length;
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}

import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { IResults, IUser, States } from '@shared/interfaces';
import { DeskService, UserService } from '@shared/services';
import { DeviceUtilityService } from '@shared/utils';
import { Subscription, interval, takeWhile } from 'rxjs';

@Component({
    selector: 'app-desk',
    templateUrl: './desk.component.html',
    styleUrls: ['./desk.component.scss'],
})
export class DeskComponent implements OnChanges, OnInit, OnDestroy {
    @Input() public cards: string[] = [];
    @Input() public cardsForBack: string[] = [];
    @Input() public results: IResults = [];
    @Input() public users: IUser[] = [];

    // @Input() public isShowCards: boolean = false;
    // @Input() public isWaitForHeader: boolean = false;
    // @Input() public isChooseCard: boolean = false;
    // @Input() public isResults: boolean = false;
    // @Input() public isHeader: boolean = false;

    @Input() public association: string = '';
    @Input() public myCardOnTheDeck: string = '';

    @Input() public state: States = States.NotStarted;

    @ViewChild('wrapCards', { static: false }) wrapCards: ElementRef;

    public readonly States: typeof States = States;

    public isRotateCards: boolean = false;

    @Output() public voteCard: EventEmitter<string> = new EventEmitter();
    @Output() public nextRound: EventEmitter<void> = new EventEmitter();

    public readonly pathToDixitCards: string = 'assets/img/dixit/';
    public readonly format: string = '.png';
    public chosenCard: string = '';
    public isEmittedNextRound: boolean = false;
    public isMobileDevice: boolean;
    public previewCard: string = '';

    private cardsInitialValues: Array<{
        top: number;
        left: number;
        width: number;
        height: number;
        zIndex: string;
        cardElement: HTMLDivElement;
    }> = [];
    private subscriptions: Subscription[] = [];

    constructor(
        private deskService: DeskService,
        private userService: UserService,
        private deviceUtilityService: DeviceUtilityService
    ) {}

    public ngOnInit(): void {
        this.subscribeOnNewRound();
        this.checkOnMobileDevice();
    }

    public async ngOnChanges(): Promise<void> {
        if (
            (States.ShowCardsForHeader === this.state ||
                States.ShowCardsAndVoting === this.state ||
                States.Results === this.state) &&
            !this.isRotateCards &&
            !this.isEmittedNextRound
        ) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            this.isRotateCards = true;
            this.initDefaultPositionAndSizeOfCard();
        }
    }

    private checkOnMobileDevice(): void {
        this.isMobileDevice = this.deviceUtilityService.isMobileDevice;
    }

    private retryInitionOfDefaultPositionAndSizeOfCard(): void {
        let success = false;
        interval(500)
            .pipe(takeWhile(() => !success))
            .subscribe(() => {
                if (this.wrapCards) {
                    success = true;
                    this.initDefaultPositionAndSizeOfCard();
                    return;
                }
            });
    }

    private async initDefaultPositionAndSizeOfCard(): Promise<void> {
        if (!this.wrapCards) {
            this.retryInitionOfDefaultPositionAndSizeOfCard();
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.cardsInitialValues = [];

        const arrayOfDomCards = Array.from(
            this.wrapCards.nativeElement.children
        ) as Array<HTMLDivElement>;

        arrayOfDomCards.forEach((card: HTMLDivElement) => {
            const { top, left, width, height } = card.getBoundingClientRect();
            const zIndex = card.style.zIndex;
            this.cardsInitialValues.push({
                top,
                left,
                width,
                height,
                zIndex,
                cardElement: card,
            });
        });
    }

    public moveToNextRound(): void {
        if (this.isEmittedNextRound) return;

        this.nextRound.emit();
        this.isEmittedNextRound = true;
    }

    private subscribeOnNewRound(): void {
        const sub = this.deskService.newRound$.subscribe(
            this.clearVariablesForNewRound.bind(this)
        );

        this.subscriptions.push(sub);
    }

    private clearVariablesForNewRound(): void {
        this.isEmittedNextRound = false;
        this.isRotateCards = false;
    }

    private voteForThisCard(card: string): void {
        if (!this.isMobileDevice) {
            if (this.hasMatcheResultsAndUsersLength) return;
            this.markUsersVote(card);
            this.voteCard.emit(card);

            return;
        }

        if (
            this.cardsInitialValues.length !== this.cards.length ||
            this.myCardOnTheDeck === card
        )
            return;

        if (this.previewCard) {
            this.backToInitialPosition(this.previewCard);
            this.voteForThisCard(card);
            return;
        }

        this.previewCard = card;
        const cardIndex = this.cards.findIndex(
            (cardFromArray) => card === cardFromArray
        );
        const cardToPreview = this.cardsInitialValues[cardIndex];

        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        const diffHeight =
            windowHeight / 2 -
            cardToPreview.top -
            cardToPreview.height / 2 -
            20;
        const diffWidth =
            windowWidth / 2 - cardToPreview.left - cardToPreview.width / 2;

        cardToPreview.cardElement.style.top = diffHeight + 'px';
        cardToPreview.cardElement.style.left = diffWidth + 'px';
        cardToPreview.cardElement.style.transform = 'scale(2)';
        cardToPreview.cardElement.style.zIndex = '11';
    }

    public async backToInitialPosition(card: string): Promise<void> {
        if (!this.isMobileDevice) return;

        this.previewCard = '';
        const cardIndex = this.cards.findIndex(
            (cardFromArray) => card === cardFromArray
        );
        const cardToPreview = this.cardsInitialValues[cardIndex];

        cardToPreview.cardElement.style.top = '0px';
        cardToPreview.cardElement.style.left = '0px';
        cardToPreview.cardElement.style.transform = 'scale(1)';

        await new Promise((resolve) => setTimeout(resolve, 300));
        cardToPreview.cardElement.style.zIndex = cardToPreview.zIndex;
    }

    public onButtonClick(card: string): void {
        this.backToInitialPosition(card);
        this.markUsersVote(card);
        this.voteCard.emit(card);
    }

    private markUsersVote(card: string): void {
        const color = this.userService.user.color as string;
        const userVote = {
            card,
            votes: [color],
            isHeaderCard: false,
        };
        this.results = [userVote];
    }

    public isHeaderCard = (card: string): boolean => {
        if (!this.hasMatcheResultsAndUsersLength) return false;
        const cardToCheckOnHeader = this.results.find(
            (result) => result.card === card
        );
        return cardToCheckOnHeader ? cardToCheckOnHeader.isHeaderCard : false;
    };

    public onMouseDown(cardElement: HTMLDivElement, card: string): void {
        if (
            States.ShowCardsForHeader === this.state ||
            this.hasMatcheResultsAndUsersLength ||
            States.Results === this.state ||
            card === this.myCardOnTheDeck
        )
            return;

        this.chosenCard = card;
        cardElement.style.transform = 'scale(0.9)';
    }

    public onMouseLeave(cardElement: HTMLDivElement): void {
        if (
            States.ShowCardsForHeader === this.state ||
            States.Results === this.state ||
            this.isMobileDevice ||
            this.hasMatcheResultsAndUsersLength
        )
            return;

        this.chosenCard = '';
        cardElement.style.transform = 'scale(1)';
    }

    public onMouseUp(cardElement: HTMLDivElement, card: string): void {
        if (
            States.ShowCardsForHeader === this.state ||
            States.Results === this.state ||
            this.hasMatcheResultsAndUsersLength ||
            this.chosenCard !== card
        )
            return;

        this.chosenCard = '';
        cardElement.style.transform = 'scale(1)';
        this.voteForThisCard(card);
    }

    public getCardLayoutClass(cardCount: number): string {
        if (cardCount <= 4) {
            return 'large';
        }
        if (cardCount > 4 && cardCount <= 7) {
            return 'medium';
        }
        if (cardCount > 7 && cardCount <= 10) {
            return 'small';
        }
        return 'small';
    }

    private get hasMatcheResultsAndUsersLength(): boolean {
        if (!this.results || !this.users) return false;
        return this.results.length === this.users.length;
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}

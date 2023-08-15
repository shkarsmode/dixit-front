import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { IResults } from 'src/shared/interfaces/IResults';
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
    @Input() public isShowCards: boolean = false;
    @Input() public isWaitForHeader: boolean = false;
    @Input() public association: string = '';
    @Input() public isChooseCard: boolean = false;
    @Input() public isHeader: boolean = false;
    @Input() public isResults: boolean = false;
    public isRotateCards: boolean = false;

    @Output() public voteCard: EventEmitter<string> = new EventEmitter();
    @Output() public nextRound: EventEmitter<void> = new EventEmitter();

    
    public readonly pathToDixitCards: string = 'assets/img/dixit/';
    public readonly format: string = '.png';
    public isEmittedNextRound: boolean = false;

    private subscriptions: Subscription[] = [];

    constructor(private deskService: DeskService) {}

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
        if (this.results.length) return;
        this.voteCard.emit(card);
    }

    public isHeaderCard = (card: string): boolean => {
        if (!this.results.length) return false;
        return this.results.find(result => result.card === card)!.isHeaderCard
    }

    public onMouseDown(cardElement: HTMLDivElement): void {
        if (this.isHeader || this.results.length) return;
        cardElement.style.transform = 'scale(0.9)';
    }

    public onMouseLeave(cardElement: HTMLDivElement): void {
        if (this.isHeader || this.results.length) return;
        cardElement.style.transform = 'scale(1)';
    }

    public onMouseUp(cardElement: HTMLDivElement, card: string): void {
        if (this.isHeader || this.results.length) return;
        cardElement.style.transform = 'scale(1)';
        this.voteForThisCard(card);
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}

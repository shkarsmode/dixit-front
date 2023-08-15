import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-hand',
    templateUrl: './hand.component.html',
    styleUrls: ['./hand.component.scss']
})
export class HandComponent {

    public isShowFirstCard: boolean = true;
    @Input() cardsOnTheTable: string[] = [];
    @Input() hand: string[];
    @Output() chooseCard: EventEmitter<string> = new EventEmitter();

    public ngOnInit(): void {
        this.firstShowCards();
        // setTimeout(() => {
        //     this.hand.push('7');
        // }, 5000);
    }

    public choose(card: string): void {
        this.chooseCard.emit(card);
    }

    private async firstShowCards(): Promise<void> {
        this.isShowFirstCard = true;
        await new Promise(resolve => setTimeout(resolve, 3000));

        this.isShowFirstCard = false;
    }
}

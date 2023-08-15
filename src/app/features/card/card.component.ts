import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent {

    public readonly pathToDixitCards: string = 'assets/img/dixit/';
    public readonly format: string = '.png';
    @Input() public card: string;
}

import {
    Component,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { States } from '@shared/interfaces';
import { DeviceUtilityService } from '@shared/utils';

@Component({
    selector: 'app-hand',
    templateUrl: './hand.component.html',
    styleUrls: ['./hand.component.scss'],
})
export class HandComponent implements OnInit {
    @Input() public cardsOnTheTable: string[] = [];
    @Input() public hand: string[];
    @Input() public state: States;
    @Output() chooseCard: EventEmitter<string> = new EventEmitter();

    @Input()
    @HostBinding('class.put-down')
    isPutDown: boolean = false;

    public isShowFirstCard: boolean = true;
    public isMobileDevice: boolean = false;
    public previewCard: string = '';

    constructor(private deviceUtilityService: DeviceUtilityService) {}

    public ngOnInit(): void {
        this.firstShowCards();
        this.checkOnMobileDevice();
    }

    private checkOnMobileDevice(): void {
        this.isMobileDevice = this.deviceUtilityService.isMobileDevice;
    }

    public choose(card: string): void {
        this.chooseCard.emit(card);
    }

    public get canToChoose(): boolean {
        switch (this.state) {
            case States.ChooseCardAsHeader:
            case States.ChooseCard:
                return true;
        }

        return false;
    }

    private async firstShowCards(): Promise<void> {
        this.isShowFirstCard = true;
        await new Promise((resolve) => setTimeout(resolve, 3000));

        this.isShowFirstCard = false;
    }

    @HostListener('window:resize')
    public onResize(): void {
        this.checkOnMobileDevice();
    }
}

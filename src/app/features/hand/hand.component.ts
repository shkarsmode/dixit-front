import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DeviceUtilityService } from 'src/app/utils/device-utility.service';

@Component({
    selector: 'app-hand',
    templateUrl: './hand.component.html',
    styleUrls: ['./hand.component.scss']
})
export class HandComponent {

    @Input() public cardsOnTheTable: string[] = [];
    @Input() public hand: string[];
    @Input() public hasAssociation: boolean = false;
    @Output() chooseCard: EventEmitter<string> = new EventEmitter();

    public isShowFirstCard: boolean = true;
    public isMobileDevice: boolean = false;
    public previewCard: string = '';

    constructor(
        private deviceUtilityService: DeviceUtilityService
    ) {}

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

    private async firstShowCards(): Promise<void> {
        this.isShowFirstCard = true;
        await new Promise(resolve => setTimeout(resolve, 3000));

        this.isShowFirstCard = false;
    }

    @HostListener('window:resize')
    public onResize(): void {
        this.checkOnMobileDevice();
    }
}

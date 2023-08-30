import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent implements AfterViewInit {

    @Output() public chooseCard: EventEmitter<string> = new EventEmitter();
    @Input() public card: string;
    @Input() public isMobileDevice: boolean;
    @Input() public hasAssociation: boolean;

    @ViewChild('cardRef', { static: true }) private cardRef: ElementRef;
    @ViewChild('previewCardRef', { static: true }) private previewCardRef: ElementRef;

    private initialPositionTop: number;
    private initialPositionLeft: number;
    private initialZIndex: number;

    private initialHeight: number;
    private initialWidth: number;

    public isPreviewCard: boolean = false;;

    public readonly pathToDixitCards: string = 'assets/img/dixit/';
    public readonly format: string = '.png';


    constructor(
        private hostRef: ElementRef
    ) {}

    public async ngAfterViewInit(): Promise<void> {
        // Delay to be sure the position of the card
        await new Promise(resolve => setTimeout(resolve, 100));
        this.initDefaultPositionAndSizeOfCard()
    }
    
    private initDefaultPositionAndSizeOfCard(): void {
        const defaultCardRect = this.cardRef.nativeElement.getBoundingClientRect() as DOMRect;
        const { top, left, height, width } = defaultCardRect;

        this.previewCardRef.nativeElement.style.left = left + 'px';
        this.previewCardRef.nativeElement.style.top = top + 'px';

        this.initialHeight = height;
        this.initialWidth = width;

        this.initialPositionTop = top;
        this.initialPositionLeft = left;

        this.initialZIndex = this.hostRef.nativeElement.style.zIndex;
    }
    
    public choose(): void {
        if (!this.isMobileDevice) {
            this.chooseCard.emit(this.card);
            return;
        }

        this.isPreviewCard = true;

        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        const diffTopToDislace = 0;
        const diffTop = windowHeight / 2 - this.initialHeight / 2 - diffTopToDislace;
        const diffLeft = windowWidth / 2 - this.initialWidth / 2;
        
        this.previewCardRef.nativeElement.style.left = diffLeft + 'px';
        this.previewCardRef.nativeElement.style.top = diffTop + 'px';
        this.previewCardRef.nativeElement.style.transform = 'scale(2)';
        this.hostRef.nativeElement.style.zIndex = '100';
        // this.chooseCard.emit(this.card);
    }

    public onButtonClick(): void {
        this.backToInitialPosition();
        this.chooseCard.emit(this.card);
    }

    public async backToInitialPosition(): Promise<void> {
        this.previewCardRef.nativeElement.style.top = this.initialPositionTop + 'px';
        this.previewCardRef.nativeElement.style.left = this.initialPositionLeft + 'px';
        this.previewCardRef.nativeElement.style.transform = 'scale(1)';
        this.hostRef.nativeElement.style.zIndex = this.initialZIndex;

        // Delay to show animation
        await new Promise(resolve => setTimeout(resolve, 300));
        this.isPreviewCard = false;
    }
    
    
}

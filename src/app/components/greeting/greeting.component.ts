import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@shared/services';
import { Socket } from 'ngx-socket-io';
import { DeviceUtilityService } from '../../shared/utils/device-utility.service';

@Component({
    selector: 'app-greeting',
    templateUrl: './greeting.component.html',
    styleUrls: ['./greeting.component.scss'],
})
export class GreetingComponent implements OnInit, AfterViewInit {
    @ViewChild('vase', { static: true }) public vase: ElementRef;
    @ViewChild('medium', { static: true }) public medium: ElementRef;
    @ViewChild('bateau', { static: true }) public bateau: ElementRef;
    @ViewChild('persstella', { static: true }) public persstella: ElementRef;
    @ViewChildren('input1, input2, input3, input4, input5') public inputList: QueryList<ElementRef>;

    public stateOfMovingSides: string = 'none';
    public roomCode: string = '';
    public clientX: number;
    public clientY: number;

    private canAnimateBackground: boolean = true;
    private inputsList: Array<ElementRef>;
    private socket: Socket;

    constructor(
        private readonly userService: UserService,
        private readonly deviceUtilityService: DeviceUtilityService,
        private readonly router: Router
    ) {
        this.socket = userService.socket;
    }

    public ngOnInit(): void {
        this.animObjects();
        this.canAnimateBackground = !this.deviceUtilityService.isMobileDevice;
    }

    public ngAfterViewInit(): void {
        this.convertParagrapsQueryListToArray();
    }

    /**
     * Converts a QueryList of elements to an array and assigns it to a class variable.
     */
    public convertParagrapsQueryListToArray = () =>
        (this.inputsList = this.inputList.toArray());

    @HostListener('mousemove', ['$event'])
    public onMouseMove(event: MouseEvent): void {
        if (!this.canAnimateBackground) return;

        this.clientX = event.clientX;
        this.clientY = event.clientY;

        const windowWidth = window.innerWidth;

        if (this.clientX <= windowWidth / 3) {
            this.stateOfMovingSides = 'left';
        } else if (
            this.clientX > windowWidth / 3 &&
            this.clientX <= (windowWidth / 3) * 2
        ) {
            this.stateOfMovingSides = 'none';
        } else {
            this.stateOfMovingSides = 'right';
        }
    }

    public async onInputKeydown(event: KeyboardEvent, index: number) {
        const input = this.inputsList[index];

        if (event.key === 'ArrowLeft' && index > 0) {
            this.inputsList[index - 1].nativeElement.focus();
            return;
        }

        if (event.key === 'ArrowRight' && index < this.inputsList.length - 1) {
            this.inputsList[index + 1].nativeElement.focus();
            return;
        }

        if (
            event.key === 'ArrowRight' ||
            event.key === 'ArrowLeft' ||
            event.key === 'ArrowUp' ||
            event.key === 'ArrowDown'
        )
            return;

        if (event.key === 'Backspace' && input.nativeElement.value === '') {
            if (index > 0) {
                this.inputsList[index - 1].nativeElement.focus();
                this.roomCode = this.roomCode.slice(0, -1);
            }
        } else {
            const isLetter = /^[a-zA-Z]$/.test(event.key);
            if (isLetter) {
                if (index < this.inputsList.length - 1) {
                    await new Promise((resolve) => setTimeout(resolve, 20));
                    this.inputsList[index + 1].nativeElement.focus();
                }
            } else {
                await new Promise((resolve) => setTimeout(resolve, 10));
                this.inputsList[index].nativeElement.value = '';
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 20));
        this.roomCode = '';
        this.inputsList.forEach((input) => {
            const value = input.nativeElement.value;
            this.roomCode += value;
        });
    }

    public generateIdForUser(): string {
        const timestamp = Date.now().toString();
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        const id = timestamp + randomNum;

        return id;
    }

    public async createRoom(): Promise<void> {
        const roomCode = this.generateUniqueRoomCode();
        await this.socket.emit('createRoom', roomCode);

        this.router.navigate(['/rooms', roomCode]);
    }

    public joinRoom(): void {
        if (!this.roomCode) return;
        this.router.navigate(['/rooms', this.roomCode]);
    }

    private animObjects(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const rangeX = 20;
        const rangeY = 30;
        const normalizedX = (this.clientX / windowWidth) * 2 - 1;
        const normalizedY = (this.clientY / windowHeight) * 2 - 1;

        const moveX = normalizedX * rangeX;
        const moveY = normalizedY * rangeY;

        this.medium.nativeElement.style.transform = `translate(${moveX}px, ${moveY}px)`;
        this.bateau.nativeElement.style.transform = `translate(${moveX}px, ${moveY}px)`;

        this.vase.nativeElement.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
        this.persstella.nativeElement.style.transform = `translate(${-moveX}px, ${-moveY}px)`;

        requestAnimationFrame(this.animObjects.bind(this));
    }

    private generateUniqueRoomCode(): string {
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let code = '';

        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }

        return code;
    }
}

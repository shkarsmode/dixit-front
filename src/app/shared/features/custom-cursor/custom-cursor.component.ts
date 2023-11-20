import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DeviceUtilityService } from '@shared/utils';

@Component({
    selector: 'app-custom-cursor',
    templateUrl: './custom-cursor.component.html',
    styleUrls: ['./custom-cursor.component.scss'],
    imports: [CommonModule],
    standalone: true,
})
export class CustomCursorComponent implements OnInit {
    @ViewChild('cursor', { static: true }) cursor: ElementRef;

    constructor(
        private readonly host: ElementRef<HTMLElement>,
        private readonly deviceUtility: DeviceUtilityService
    ) {}

    public ngOnInit(): void {
        this.checkOnMobileDeviceAndDestoryHost();
        this.initCursorFeature();
    }

    private checkOnMobileDeviceAndDestoryHost(): void {
        const isMobile = this.deviceUtility.isMobileDevice;
        if (isMobile) this.destroy();
    }

    private initCursorFeature(): void {
        new Cursor(this.cursor, 1);
    }

    private destroy(): void {
        this.host.nativeElement.remove();
    }
}


interface MousePosition {
	x: number;
	y: number;
}

class Cursor {
    private _position: MousePosition = { x: 0, y: 0 };
    private _target: MousePosition = { x: 0, y: 0 };
    private _easingFactor: number;

    constructor(
        private readonly _object: ElementRef,
        private readonly _delay: number = 0.2
    ) {
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('click', this._onMouseClick);
        requestAnimationFrame(this._update.bind(this));
        this._easingFactor = this._delay;
    }

    /**
     * Handles the mouse move event and updates the target object's x and y properties with the
     * clientX and clientY values
     * @param event - The MouseEvent object containing information about the mouse event
     */
    private _onMouseMove = (event: MouseEvent) => {
        this._target.x = event.clientX;
        this._target.y = event.clientY;
    };

    private _onMouseClick = (event: MouseEvent) => {
        this._object.nativeElement.classList.add('clicked');
        setTimeout(
            () => this._object.nativeElement.classList.remove('clicked'),
            500
        );
    };

    /**
     * Updates the position of the object element using the target and position objects, and the
     * easing factor
     */
    private _update(): void {
        const dx = this._target.x - this._position.x + 20;
        const dy = this._target.y - this._position.y + 20;

        this._position.x += dx * this._easingFactor;
        this._position.y += dy * this._easingFactor;

        if (this._object) {
            const object = this._object.nativeElement;

            const xDiff = this._position.x - object.offsetWidth / 2;
            const yDiff = this._position.y - object.offsetHeight / 2;

            // object.style.transform = `translate(${xDiff}px, ${yDiff}px)`;
            object.style.left = `${xDiff}px`;
            object.style.top = `${yDiff}px`;
        }

        requestAnimationFrame(this._update.bind(this));
    }
}
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DeviceUtilityService } from 'src/app/shared/utils/device-utility.service';

@Component({
    selector: 'app-custom-cursor',
    templateUrl: './custom-cursor.component.html',
    styleUrls: ['./custom-cursor.component.scss']
})
export class CustomCursorComponent implements OnInit {

    @ViewChild('cursor', { static: true }) cursor: ElementRef;

    constructor(
		private host: ElementRef<HTMLElement>,
		private deviceUtility: DeviceUtilityService
	){}

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
	private position: MousePosition = { x: 0, y: 0 };
	private target: MousePosition = { x: 0, y: 0 };
	private easingFactor: number;

	constructor(private object: ElementRef, private delay: number = 0.2) {
		window.addEventListener("mousemove", this.onMouseMove);
		window.addEventListener("click", this.onMouseClick);
		requestAnimationFrame(this.update.bind(this));
		this.easingFactor = this.delay;
	}

	/**
	* Handles the mouse move event and updates the target object's x and y properties with the 
	* clientX and clientY values
	* @param event - The MouseEvent object containing information about the mouse event
	*/
	private onMouseMove = (event: MouseEvent) => {
		this.target.x = event.clientX;
		this.target.y = event.clientY;
	}

	private onMouseClick = (event: MouseEvent) => {
		this.object.nativeElement.classList.add('clicked');
		setTimeout(() => this.object.nativeElement.classList.remove('clicked'), 500);
	}

	/**
	* Updates the position of the object element using the target and position objects, and the 
	* easing factor
	*/
	private update(): void {
		const dx = this.target.x - this.position.x + 20;
		const dy = this.target.y - this.position.y + 20;

		this.position.x += dx * this.easingFactor;
		this.position.y += dy * this.easingFactor;

		if (this.object) {
			const object = this.object.nativeElement;

			const xDiff = this.position.x - object.offsetWidth / 2;
			const yDiff = this.position.y - object.offsetHeight / 2;
			
			// object.style.transform = `translate(${xDiff}px, ${yDiff}px)`;
			object.style.left = `${xDiff}px`;
			object.style.top = `${yDiff}px`;
		}
	
		requestAnimationFrame(this.update.bind(this));
	}
}
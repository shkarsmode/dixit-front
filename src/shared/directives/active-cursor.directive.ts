import { Directive, HostListener, Renderer2 } from '@angular/core';

@Directive({
	selector: '[activeCursor]'
})
export class ActiveCursorDirective {

	private cursor: HTMLDivElement | null = null;

	constructor(private renderer: Renderer2) {}

	@HostListener('mouseenter') 
	public onMouseEnter(): void {
		this.cursor = document.querySelector('.cursor');

		if (!this.cursor) return;

		this.renderer?.addClass(this.cursor, 'hover');	
	}

	@HostListener('mouseleave') 
	public onMouseLeave(): void {
		if (!this.cursor) return;
		
		this.renderer?.removeClass(this.cursor, 'hover');
	}
}

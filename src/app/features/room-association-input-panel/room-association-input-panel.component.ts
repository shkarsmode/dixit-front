import { Component, EventEmitter, Output } from '@angular/core';

@Component({
	selector: 'app-room-association-input-panel',
	templateUrl: './room-association-input-panel.component.html',
	styleUrls: ['./room-association-input-panel.component.scss'],
})
export class RoomAssociationInputPanelComponent {

	public association: string;
	@Output() associationChanged: EventEmitter<string> = new EventEmitter();

	public onAssociationChange = () => 
		this.associationChanged.emit(this.association);
		
}

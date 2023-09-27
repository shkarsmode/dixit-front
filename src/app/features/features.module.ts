import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    CardComponent,
    DeskComponent,
    HandComponent,
    RoomAssociationInputPanelComponent,
    RoomBackgroundImagesComponent,
    RoomUsersComponent,
    RoomWaitingFlowComponent
} from '@features';
import { ActiveCursorDirective } from '@shared/directives';
import { MaterialModule } from '@shared/modules';

const FeatureComponents = [
    CardComponent,
    HandComponent,
    RoomUsersComponent,
    DeskComponent,
    RoomWaitingFlowComponent,
    RoomBackgroundImagesComponent,
    RoomAssociationInputPanelComponent
];

@NgModule({
    declarations: [
        ...FeatureComponents,
        ActiveCursorDirective
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule
    ],
    exports: [
        ...FeatureComponents, 
        ActiveCursorDirective
    ]
})
export class FeaturesModule {}

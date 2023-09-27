import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    AdminPanelComponent,
    GreetingComponent,
    RoomComponent
} from '@components';
import { MaterialModule } from '@shared/modules';
import { FeaturesModule } from '../features/features.module';

@NgModule({
    declarations: [
        RoomComponent,
        AdminPanelComponent,
        GreetingComponent
    ],
    imports: [
        CommonModule,
        FeaturesModule,
        MaterialModule
    ],
})
export class ComponentsModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GreetingComponent } from './components/greeting/greeting.component';
import { RoomComponent } from './components/room/room.component';

const routes: Routes = [
    { path: '', component: GreetingComponent },
    { path: 'rooms/:roomCode', component: RoomComponent },
    {
        path: '**', redirectTo: '/', pathMatch: 'full'
    }
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

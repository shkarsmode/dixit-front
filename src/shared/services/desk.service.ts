import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DeskService {

    private newRoundSubject: Subject<void> = new Subject();
    public newRound$: Observable<void> = this.newRoundSubject.asObservable();

    public emitNewRound = () => this.newRoundSubject.next();
    
}

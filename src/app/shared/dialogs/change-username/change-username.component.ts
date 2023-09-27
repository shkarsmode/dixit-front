import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '@shared/modules';
import { UserService } from '@shared/services';
import { Subscription, interval, takeWhile } from 'rxjs';

@Component({
    selector: 'app-change-username',
    templateUrl: './change-username.component.html',
    styleUrls: ['./change-username.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MaterialModule
    ],
    standalone: true
})
export class ChangeUsernameComponent implements OnInit, OnDestroy {

    public userColor: string | undefined;
    public username = new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(13)
    ]);

    private subsciption: Subscription;

    constructor(
        private userService: UserService,
        private dialogRef: MatDialogRef<ChangeUsernameComponent>,
        @Inject(MAT_DIALOG_DATA) public roomCode: string
    ) {}

    public ngOnInit(): void {
        this.initUserColor();
    }

    public changeUserName(): void {
        if (this.username.invalid) return;

        this.userService.changeUserName(this.roomCode, this.username.value!);
        localStorage.setItem('username', this.username.value!);
        
        this.close();
    }

    private initUserColor(): void {
        let success = false;
        const sub = 
            interval(500)
                .pipe(takeWhile(() => !success))
                .subscribe(() => {
                    this.userColor = this.userService.user?.color;
                    if (this.userColor) {
                        success = true;
                        return;
                    }
            });

        this.subsciption = sub;
    }

    private close(): void {
        this.dialogRef.close();
    }

    public ngOnDestroy(): void {
        this.subsciption.unsubscribe();
    }
}

import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { HomeComponent } from './home.component';

@NgModule({
    declarations: [HomeComponent],
    imports: [
        NativeScriptCommonModule
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class HomeModule { }

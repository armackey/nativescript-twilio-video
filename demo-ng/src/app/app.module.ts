import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomeComponent } from './home/home.component';
import { registerElement } from 'nativescript-angular/element-registry';
import { VideoActivity, LocalVideo, RemoteVideo } from 'nativescript-twilio-video';
// import { HomeModule } from './home/home.module';
registerElement('VideoActivity', () => require('nativescript-twilio-video').VideoActivity);
registerElement('LocalVideo', () => require('nativescript-twilio-video').LocalVideo);
registerElement('RemoteVideo', () => require('nativescript-twilio-video').RemoteVideo);
// Uncomment and add to NgModule imports if you need to use two-way binding
import { NativeScriptFormsModule } from "nativescript-angular/forms";

// Uncomment and add to NgModule imports if you need to use the HttpClient wrapper
// import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        AppRoutingModule,
        // HomeModule
    ],
    declarations: [
        AppComponent,
        // ItemsComponent,
        // ItemDetailComponent,
        HomeComponent
    ],
    providers: [
        VideoActivity,
        LocalVideo,
        RemoteVideo
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { }

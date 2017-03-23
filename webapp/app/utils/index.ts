import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {SetFocusDirective} from "./directives/set-focus";
import {SiteCopyrightComponent} from "./site-copyright"

@NgModule({
    imports: [],
    declarations: [
      SetFocusDirective,
      SiteCopyrightComponent
    ],
    exports: [
        SetFocusDirective, SiteCopyrightComponent
    ],
    // entryComponents: [MessageModalContent],
    // providers: [
    //   MessageService,
    //   { provide: ErrorHandler, useClass: MessageErrorHandler }
    // ]
})
export class UtilsModule {}

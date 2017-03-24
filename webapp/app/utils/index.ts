import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {CRSFAnchorDirective} from "./directives/crsf-anchor"
import {SetFocusDirective} from "./directives/set-focus";
import {SiteCopyrightComponent} from "./site-copyright"

@NgModule({
    imports: [],
    declarations: [
      SetFocusDirective,
      CRSFAnchorDirective,

      SiteCopyrightComponent
    ],
    exports: [
        CRSFAnchorDirective, SetFocusDirective, SiteCopyrightComponent
    ],
    // entryComponents: [MessageModalContent],
    // providers: [
    //   MessageService,
    //   { provide: ErrorHandler, useClass: MessageErrorHandler }
    // ]
})
export class UtilsModule {}

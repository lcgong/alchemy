import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {SetFocusDirective} from "./directives/set-focus";

@NgModule({
    imports: [],
    declarations: [
      SetFocusDirective
    ],
    exports: [
        SetFocusDirective,
    ],
    // entryComponents: [MessageModalContent],
    // providers: [
    //   MessageService,
    //   { provide: ErrorHandler, useClass: MessageErrorHandler }
    // ]
})
export class UtilsModule {}

import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { MessageService } from "./message.service";
import { MessageErrorHandler } from "./MessageErrorHandler";
import { MessageModalContent } from "./error-dialog";
import { MessageBarComponent } from "./message-bar.component";
import "./message-bar.css";

@NgModule({
    imports: [BrowserModule, FormsModule, ReactiveFormsModule, NgbModule],
    declarations: [
      MessageBarComponent, MessageModalContent,
    ],
    exports: [
        MessageBarComponent,
    ],
    entryComponents: [MessageModalContent],
    providers: [
      MessageService,
      { provide: ErrorHandler, useClass: MessageErrorHandler }
    ]
})
export class MessageBarModule {}

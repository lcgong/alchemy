import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NotificationBarComponent } from "./notification-bar.component";
import { MessageService } from "./message.service";
import { MessageErrorHandler } from "./MessageErrorHandler";
import {MessageModalContent} from "./error-dialog";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import "./notification.css";

@NgModule({
    imports: [BrowserModule, FormsModule, ReactiveFormsModule, NgbModule],
    declarations: [NotificationBarComponent, MessageModalContent],
    exports: [NotificationBarComponent],
    entryComponents: [MessageModalContent],
    providers: [
      MessageService,
      { provide: ErrorHandler, useClass: MessageErrorHandler }
    ]
})
export class NotificationModule {}

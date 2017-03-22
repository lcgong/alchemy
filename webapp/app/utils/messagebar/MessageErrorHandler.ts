import { ErrorHandler, Injectable } from "@angular/core";
import { MessageService } from "./message.service";


import {Response} from "@angular/http";

@Injectable()
export class MessageErrorHandler implements ErrorHandler {

    constructor(private message: MessageService) {
    }

    handleError(error: any) {
      console.error("ERROR: %o", error);
      if (error instanceof Response) {
        let msg = error instanceof Error ? error.message : error.toString();
        setTimeout(() => {
          this.message.error(msg);
        }, 0);
      }
    }
}

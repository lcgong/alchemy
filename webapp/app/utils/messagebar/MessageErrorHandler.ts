import { ErrorHandler, Injectable } from "@angular/core";
import { MessageService } from "./message.service";


@Injectable()
export class MessageErrorHandler implements ErrorHandler {

    constructor(private message: MessageService) {
    }

    handleError(error: any) {
      console.log("ERROR: %O", error);
      let msg = error instanceof Error ? error.message : error.toString();
      setTimeout(() => {
        this.message.error(msg);
      }, 0);
    }
}

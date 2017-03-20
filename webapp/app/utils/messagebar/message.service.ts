import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

export class Message {
  constructor(public text: string, public level: string = 'info') {
  }
}

@Injectable()
export class MessageService {
    private subject = new Subject<Message>();

    error(msg: string) {
      this.subject.next(new Message(msg, 'error'));
    }

    warn(msg: string) {
      this.subject.next(new Message(msg, 'warn'));
    }

    success(msg: string) {
      this.subject.next(new Message(msg, 'info'));
    }

    info(msg: string) {
      this.subject.next(new Message(msg, 'info'));
    }

    get messages(): Observable<Message> {
      return this.subject;
    }
}

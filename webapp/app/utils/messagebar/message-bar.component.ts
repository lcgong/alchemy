import {
  Component, Input, IterableDiffers, IterableDiffer, ApplicationRef
} from "@angular/core";

import { Message, MessageService } from "./message.service";
import { Observable } from "rxjs/Observable";

import { animate, trigger,  transition, style, keyframes } from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MessageModalContent} from "./error-dialog";

@Component({
  selector: "message-bar",
  template: `
  <div  class="message-bar">
    <div *ngFor="let msg of hints" class="alert" [@hintState]="msg"
      [class.alert-warning]="msg.level=='warn'"
      [class.alert-success]="msg.level=='info'">
      <h4>{{msg.text}}</h4>
    </div>
  </div>
  `,
  animations: [
    trigger('hintState', [
      transition('void => *', [
      animate(300, keyframes([
          style({opacity: 0, transform: 'translateX(-100%)', offset: 0}),
          style({opacity: 1, transform: 'translateX(15px)',  offset: 0.3}),
          style({opacity: 1, transform: 'translateX(0)',     offset: 1.0})
        ]))
      ]),
      transition('* => void', [
        animate(300, keyframes([
          style({opacity: 1, transform: 'translateX(0)',     offset: 0}),
          style({opacity: 1, transform: 'translateX(-15px)', offset: 0.7}),
          style({opacity: 0, transform: 'translateX(100%)',  offset: 1.0})
        ]))
      ])
    ])
  ]
})

export class MessageBarComponent {
  hints = new Array<Message>();

  errors = new Array<Message>();
  differ: IterableDiffer;
  errorDialogOpen = false;
  modalRef: NgbModalRef = null;


  constructor(private modal: NgbModal,
    messageService: MessageService, differs: IterableDiffers,
    appRef: ApplicationRef
  ) {
    this.differ = differs.find([]).create(null);

    messageService.messages.subscribe(msg => {
      if (msg.level != 'error') { // show message as as hint
        this.pushHint(msg);
      } else { // show an alert if it's error message.
        this.showInErrorDialog(msg);
        // this.errors.push(msg);
        // appRef.tick();
      }
    });
  }

  // ngDoCheck(): void {
  //   let changes = this.differ.diff(this.errors);
  //
  //   if (changes) {
  //     changes.forEachAddedItem((r: any) => {
  //       // this.showInErrorDialog();
  //       // console.log('Added', r.item)
  //     });
  //
  //     changes.forEachRemovedItem((r: any) => {
  //       console.log('Removed', r.item)
  //     });
  //   }
  // }

  private showInErrorDialog(msg: Message) {
    if (this.modalRef == null)  {
      this.modalRef = this.modal.open(MessageModalContent, {windowClass: 'error-message-modal'});
      this.modalRef.result.then((result: any) => {
        this.modalRef = null;
      }, (reason: any) => {
        this.modalRef = null;
      });;
    }

    this.modalRef.componentInstance.pushMessage(msg);
  }


  private pushHint(msg: Message) {
    let hints = this.hints;
    hints.splice(0, 0, msg); // insert at head

    let expiresIn = (msg.level == 'warn') ? 5000: 2500;
    setTimeout(function() {
      let index = hints.indexOf(msg);
      if (index != -1) {
        hints.splice(index, 1); // delete the message
      }
    }, expiresIn);
  }
}

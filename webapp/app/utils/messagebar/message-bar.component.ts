import {
  Component, Input, IterableDiffers, IterableDiffer, ApplicationRef
} from "@angular/core";

import { Message, MessageService } from "./message.service";
import { Observable } from "rxjs/Observable";

import { animate, trigger,  transition, style, keyframes } from '@angular/core';
// import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MessageModalContent} from "./error-dialog";

import {bounceInDownBig, bounceOutDownBig} from "app/utils/animation";


@Component({
  selector: "message-bar",
  template: `
  <div  class="message-bar"
    [class.backdrop]="errors.length > 0">

    <div class="error-message-modal"
      [@errorState]="true"
      *ngIf="errors.length > 0">
      <div class="modal-content">
        <div class="modal-header ">
          <h4>有错发发生</h4>
          <button type="button" class="btn btn-success"
            set-focus="true" (click)="confirm()">
            了解
          </button>
        </div>
        <div class="modal-body">
          <ul>
            <li *ngFor="let msg of errors">{{msg.text}}</li>
          </ul>
        </div>
      </div>
    </div>

    <div *ngFor="let msg of hints" class="alert" [@hintState]="true"
      [class.alert-danger]="msg.level=='error'"
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
    ]),
    trigger('errorState', [
      transition('void => *', [animate(300, bounceInDownBig)]),
      transition('* => void', [animate(300, bounceOutDownBig)])
    ])
  ]
})

export class MessageBarComponent {
  hints = new Array<Message>();

  errors = new Array<Message>();
  differ: IterableDiffer;
  errorDialogOpen = false;
  // modalRef: NgbModalRef = null;

  // @input()
  errorModalContent: any;

  constructor(
    // private modal: NgbModal,
    messageService: MessageService, differs: IterableDiffers,
    // appRef: ApplicationRef
  ) {
    this.differ = differs.find([]).create(null);

    messageService.messages.subscribe(msg => {
      if (msg.level != 'error') { // show message as as hint
        this.pushHint(msg);
      } else { // show an alert if it's error message.
        // this.pushHint(msg);

        // setTimeout(() => {
        //   this.showInErrorDialog(msg);
        // }, 0);
        this.errors.splice(0, 0, msg);  // insert at head
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

  confirm() {
    console.log('n=', this.errors.length);
    this.errors.splice(0,  this.errors.length); // delete the message
  }

  // private showInErrorDialog(msg: Message) {
  //   console.log(33211, msg);
  //   // let modalRef = this.modal.open(MessageModalContent, {windowClass: 'error-message-modal'});
  //   // modalRef.result.then((result: any) => {
  //   // }, (reason: any) => {
  //   // });;
  //
  //   if (this.modalRef == null)  {
  //     this.modalRef = this.modal.open(MessageModalContent, {windowClass: 'error-message-modal'});
  //     this.modalRef.componentInstance.pushMessage(msg);
  //
  //     this.modalRef.result.then((result: any) => {
  //       this.modalRef = null;
  //     }, (reason: any) => {
  //       this.modalRef = null;
  //     });;
  //   }
  // }

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

// import {Component, Input} from '@angular/core';
//
// import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
// import {Message} from "./message.service";
//
//
// @Component({
//   selector: 'message-dialog-content',
//   template: `
//     <div class="modal-header">
//       <h4 class="modal-title">注意！有情况...</h4>
//     </div>
//     <div class="modal-body">
//       <ul class="alert1 alert1-danger">
//         <li *ngFor="let msg of errors">
//           {{msg.text}}
//         </li>
//       </ul>
//     </div>
//     <div class="modal-footer">
//       <button type="button" class="btn btn-success"
//         set-focus="true"
//         (click)="modal.close()">好的，了解</button>
//     </div>
//   `
// })
// export class MessageModalContent {
//   @Input() errors = Array<Message>();
//
//   constructor(private modal: NgbActiveModal) {
//   }
//
//   pushMessage(msg: Message){
//     this.errors.splice(0,0, msg);
//   }
// }
//
// //
// // @Component({
// //   selector: 'ngbd-modal-basic',
// //   template: './modal-basic.html'
// // })
// // export class MessageModal {
// //   closeResult: string;
// //
// //   constructor(private modalService: NgbModal) {}
// //
// //   open(content) {
// //     this.modalService.open(content).result.then((result) => {
// //       this.closeResult = `Closed with: ${result}`;
// //     }, (reason) => {
// //       this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
// //     });
// //   }
// //
// //   private getDismissReason(reason: any): string {
// //     if (reason === ModalDismissReasons.ESC) {
// //       return 'by pressing ESC';
// //     } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
// //       return 'by clicking on a backdrop';
// //     } else {
// //       return  `with: ${reason}`;
// //     }
// //   }
// // }

import {Component} from '@angular/core';

// import {AuthService} from './auth_service';
import {
  FormGroup, FormBuilder, Validators, AbstractControl
} from "@angular/forms";

import { Observable } from "rxjs";


import {MessageService} from "app/utils/messagebar/message.service";
import {ServiceClient} from "app/utils/service/client";
import {AuthService} from "./auth_service";

@Component({
  selector: 'signup-form',
  template: `
  <form  novalidate class="form signup" [formGroup]="frm">
    <div class="form-group"
      [class.field-has-error]="username.hasError('alreadyTaken')">
      <label for="username">姓名或昵称:</label>
      <span class="field-error-message"
        *ngIf="username.hasError('alreadyTaken')">该名已被占用，请换一个
      </span>
      <input class="form-control" name="username"
        [formControl]="frm.controls.username">
    </div>
    <div class="form-group">
      <label for="email">电子邮件:</label>
      <input class="form-control" name="email" [formControl]="frm.controls.email">
    </div>
    <button class="btn btn-success" (click)="onSubmit(frm.value)">注册新用户</button>
  </form>
  `
})
export class SignupForm {

  private frm: FormGroup;
  private username: AbstractControl;

  constructor(fb: FormBuilder,
    private message: MessageService,
    private service: ServiceClient,
    private authService : AuthService
  ) {

    this.frm = fb.group({
      'username': ['', Validators.required],
      'title': ['', Validators.required],
      'email': ['', Validators.required]
    });

    this.username = this.frm.controls.username;

    let usernameCtrl = this.frm.controls.username;;
    usernameCtrl.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe((username: string) => {
        usernameCtrl.setErrors({alreadyTaken: true});
        authService.checkUserName(username).subscribe((result) => {
          usernameCtrl.setErrors({alreadyTaken: true});
        });
      });
  }

  onSubmit(value: string): void {
    console.log('you submitted value: ', value);
    // this.message.info('13: ' + value);

    this.service.post('abccd').subscribe((resp: any) => {
      console.log(resp);
    });
  }

  makeValidator() {
    let authService =  this.authService;

    return function(ctrl: AbstractControl) {
      console.log('dd', ctrl);
      return  new Observable((obs: any) => {
        ctrl.valueChanges.debounceTime(500).distinctUntilChanged()
          .subscribe(data => {
            console.log(123, data);
            obs.next({ ['usernameInvalid']: true });
            obs.complete();

            // return authService.checkUserName(data).subscribe(result =>{
            //   obs.next({ ['usernameInvalid']: true });
            //   obs.complete();
            // }, (err)=> {
            //   console.log(555, err);
            //   obs.next({ ['usernameInvalid']: false});
            //   obs.complete();
            // })
            // console.log(123, data);
          });
      });
    }
  }


  static usernameValidator(ctrl: AbstractControl): any {
    console.log('ddd',  ctrl.value);
    let authService =  this.authService;
    return  new Observable((obs: any) => {
      ctrl.valueChanges.debounceTime(500).distinctUntilChanged()
        .subscribe(data => {
          console.log(123, data);
          obs.next({ ['usernameInvalid']: true });
          obs.complete();
          // return authService.checkUserName(data).subscribe(result =>{
          // });
        }, (error) =>{
          console.log('error', error);

        }, () => {
          console.log('vchg, done');
        });
    });

    // let authService =  this.authService;
    // return  new Observable((obs: any) => {
    //   ctrl.valueChanges.debounceTime(500).distinctUntilChanged()
    //     .subscribe(data => {
    //       console.log(123, data);
    //       obs.next({ ['usernameInvalid']: true });
    //       obs.complete();
    //       // return authService.checkUserName(data).subscribe(result =>{
    //       // });
    //     }, (error) =>{
    //       console.log('error', error);
    //
    //     }, () => {
    //       console.log('vchg, done');
    //     });
    // });
  }

  // constructor(private authService: AuthService) {
  //   this.message = '';
  // }

  // registerNewUser(username:string, title:string, email: string) {
  //   console.log(username, title, email);
  // }

  // login(username: string, password: string): boolean {
  //   this.message = '';
  //   if (!this.authService.login(username, password)) {
  //     this.message = 'Incorrect credentials.';
  //     setTimeout(function() {
  //       this.message = '';
  //     }.bind(this), 2500);
  //   }
  //   return false;
  // }

  // logout(): boolean {
  //   this.authService.logout();
  //   return false;
  // }
}

//
// import { ReflectiveInjector } from "@angular/core";
// // import {BaseRequestOptions, Http} from '@angular/http';
// import {MockBackend} from '@angular/http/testing';
// import {Http, HTTP_PROVIDERS} from '@angular/http';
//
// var injector = ReflectiveInjector.resolveAndCreate([
//   BaseRequestOptions,
//   MockBackend,
//   {provide: Http, useFactory:
//       function(backend, defaultOptions) {
//         return new Http(backend, defaultOptions);
//       },
//       deps: [MockBackend, BaseRequestOptions]}
// ]);
// var http = injector.get(Http);

//
// function checkUser(control: Control, source: string) : Observable<IUsernameEmailValidator> {
//
//   let http = injector.get(Http);
//
//   return new Observable((obs: any) => {
//     control
//       .valueChanges
//       .debounceTime(400)
//       .flatMap(value => http.post(CHECK_USER_ENDPOINT, JSON.stringify({ [source]: value })))
//       .subscribe(
//         data => {
//           obs.next(null);
//           obs.complete();
//         },
//         error => {
//           let message = error.json().message;
//           let reason;
//           if (message === 'Username taken') {
//             reason = 'usernameTaken';
//           }
//           if (message === 'Email taken') {
//             reason = 'emailTaken';
//           }
//           obs.next({ [reason]: true });
//           obs.complete();
//         }
//     );
//   });
// }

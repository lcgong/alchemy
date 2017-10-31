// 下面这三个包必须开始就加载
import "reflect-metadata";
import "shim";
import "zone.js";

import {enableProdMode} from '@angular/core';
declare var WebAppEnviroment: any;
if (!WebAppEnviroment.debug) { enableProdMode(); }
//-------------------------------------------------------------------------

import { NgModule, Component } from '@angular/core';

@Component({
  selector: 'signup-app',
  template: `
  <div class="app-header">
    <message-bar></message-bar>
  </div>
  <div class="app-content" >
    <signup-form ></signup-form>
  </div>
  <div class="app-footer"><site-copyright></site-copyright></div>
  `
})
export class SignupAppComponent {
  name: string = '';
  constructor() {
  }
};

// ------------------------------------------------------------------------
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ErrorHandler} from "@angular/core";

// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MessageBarModule } from 'app/utils/messagebar/message-bar.module';
import { MessageErrorHandler } from 'app/utils/messagebar/MessageErrorHandler';

import { ServiceModule } from 'app/utils/service/index';

import { SignupForm } from './signup.component';
import {AuthService} from "./auth_service";

import {UtilsModule} from "app/utils/index";

@NgModule({
    imports: [
      BrowserModule,  FormsModule, ReactiveFormsModule,
      // NgbModule.forRoot(),
      MessageBarModule,
      ServiceModule,
      UtilsModule,
    ],
    declarations: [
        SignupAppComponent, SignupForm,
    ],
    bootstrap: [SignupAppComponent],
    providers: [AuthService]
})
export class MainModule {
  constructor() {
    console.log('main module created');
  }
}


//----------------------------------------------------------------------------
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
platformBrowserDynamic().bootstrapModule(MainModule);

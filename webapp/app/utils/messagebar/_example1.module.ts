// 下面这三个包必须开始就加载
import "reflect-metadata";
import "shim";
import "zone.js";

import {enableProdMode} from '@angular/core';
declare var WebAppEnviroment: any;
if (!WebAppEnviroment.debug) { enableProdMode(); }
//-------------------------------------------------------------------------

import { NgModule, Component } from '@angular/core';
import {MessageService} from "./message.service";

@Component({
  selector: 'example-app',
  template: `
  <message-bar></message-bar>
  <hr>
  <button class="btn btn-success" (click)="notifySuccess()">提示信息</button>
  <button class="btn btn-success" (click)="notifyError()">提示发生错误</button>
  `
})
export class ExampleAppComponent {
  constructor(private message: MessageService) {
  }
  private count = 1;
  notifySuccess() {
    if (this.count % 2 == 0 ){
      this.message.warn(`hi [ count=${this.count++} ]`);
    } else {
      this.message.success(`hi [ count=${this.count++} ]`);
    }
  }
  notifyError() {
    this.message.error('this errors')
  }
};

// ------------------------------------------------------------------------
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { MessageBarModule } from './message-bar.module'

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        BrowserModule, HttpModule, FormsModule, ReactiveFormsModule,
        NgbModule.forRoot(),

        MessageBarModule
    ],
    declarations: [
        ExampleAppComponent
    ],
    bootstrap: [ExampleAppComponent]
})
export class MainModule {}


//----------------------------------------------------------------------------
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
platformBrowserDynamic().bootstrapModule(MainModule);

// 下面这三个包必须开始就加载
import "reflect-metadata";
import "shim";
import "zone.js";

import {enableProdMode} from '@angular/core';
declare var WebAppEnviroment: any;
if (!WebAppEnviroment.debug) { enableProdMode(); }
// -------------------------------------------------------------------------

import { NgModule, Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { WhoComponent } from './who.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule
    ],
    declarations: [
        WhoComponent,
    ],
    bootstrap: [WhoComponent]
})
export class MainModule {
  constructor() {
    console.log('main module created');
  }
}


//----------------------------------------------------------------------------
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
platformBrowserDynamic().bootstrapModule(MainModule);

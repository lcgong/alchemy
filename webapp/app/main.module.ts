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

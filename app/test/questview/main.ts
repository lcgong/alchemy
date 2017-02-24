import 'jquery';
import 'tether';
import 'bootstrap/dist/js/bootstrap.min';
import 'bootstrap/dist/css/bootstrap.min.css!';


// The following must be included at first.
import 'zone.js';
import 'reflect-metadata';

// ---------------------------------------------------------------------------
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {TestAppComp} from './test';

@NgModule({
  declarations: [
    TestAppComp,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [TestAppComp]
})
export class AppModule {
}

platformBrowserDynamic().bootstrapModule(AppModule); // bootstrap this app

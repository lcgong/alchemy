import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import {QmarkModule} from '../../../qmark';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, FormsModule, 
    QmarkModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}

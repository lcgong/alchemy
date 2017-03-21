import { NgModule } from "@angular/core";
// import { BrowserModule } from "@angular/platform-browser";
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ServiceClient } from "./client";

@NgModule({
    imports: [HttpModule],
    // declarations: [ServiceClient],
    // exports: [ServiceClient],
    providers: [
      ServiceClient
    ]
})
export class ServiceModule {}

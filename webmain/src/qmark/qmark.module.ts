import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';
import { QmarkComponent } from './qmark.component';
import { QmarkService } from './qmark.service';

import { QuestionModule } from "./question.module";

@NgModule({
  imports: [CommonModule, HttpModule, QuestionModule],
  declarations: [
    QmarkComponent,
  ],
  providers: [QmarkService],
  exports: [
    QmarkComponent,
  ],
  entryComponents: [QmarkComponent]
})
export class QmarkModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: QmarkModule,
    };
  }
}

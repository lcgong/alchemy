import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';
import { QmarkComponent } from './qmark.component';
import { QmarkService } from './qmark.service';
// import { MarkdownConfig } from './markdown.config';

import { QuestionComponent } from './question/question.component';
import { SubquestionComponent } from './subquestion/subquestion.component';
import { BlankComponent } from './blank/blank.component';
import { OptionGroupComponent } from './option-group/option-group.component';
import { QuestionOptionComponent } from './question-option/question-option.component';
import { SolutionComponent } from './solution/solution.component';


@NgModule({
  imports: [CommonModule,HttpModule],
  declarations: [
    QmarkComponent,
    BlankComponent,
    OptionGroupComponent,
    QuestionOptionComponent,
    QuestionComponent,
    SubquestionComponent,
    SolutionComponent,    
  ],
  providers: [QmarkService],
  exports: [
    QmarkComponent,
    BlankComponent,
    OptionGroupComponent,
    QuestionOptionComponent,
    QuestionComponent,
    SubquestionComponent,
    SolutionComponent,    
  ],
  entryComponents: [QmarkComponent]
})
export class QmarkModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: QmarkModule,
      // providers: [MarkdownConfig]
    };
  }
}

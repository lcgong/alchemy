import { NgModule } from '@angular/core';

import { QuestionComponent } from './question/question.component';
import { SubquestionComponent } from './subquestion/subquestion.component';
import { BlankComponent } from './blank/blank.component';
import { OptionGroupComponent } from './option-group/option-group.component';
import { QuestionOptionComponent } from './question-option/question-option.component';
import { SolutionComponent } from './solution/solution.component';


@NgModule({
  declarations: [
    QuestionComponent,
    SubquestionComponent,
    BlankComponent,
    OptionGroupComponent,
    QuestionOptionComponent,
    SolutionComponent,    
  ],
  exports: [
    QuestionComponent,
    SubquestionComponent,
    BlankComponent,
    OptionGroupComponent,
    QuestionOptionComponent,
    SolutionComponent,    
  ]
})
export class QuestionModule {
}

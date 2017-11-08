import { Component, OnInit, AfterViewInit, AfterContentInit } from '@angular/core';
import { QueryList, ViewChild, ContentChildren } from '@angular/core';
import { ModelService } from "../model.service";

import { QuestionOptionComponent } from "../question-option/question-option.component";

@Component({
  selector: 'option-group',
  templateUrl: './option-group.component.html',
  styleUrls: ['./option-group.component.css']
})
export class OptionGroupComponent implements OnInit,  AfterContentInit {

  @ContentChildren(QuestionOptionComponent)
  private optionCompnents: QueryList<QuestionOptionComponent>;

  constructor(
    private modelService:ModelService
  ) { 
    
  } 

  ngOnInit() {
  }
  
  ngAfterContentInit() {
    // this.optionCompnents.forEach(comp => {
    //   console.log('NO:', comp.no)
    // });
  }

}

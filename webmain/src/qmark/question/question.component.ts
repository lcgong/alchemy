import { Component, Input, OnInit } from '@angular/core';
import { ContentChild } from '@angular/core';
import { ContentChildren, AfterContentInit, QueryList } from '@angular/core';

import { Subscription }   from 'rxjs/Subscription';

import { ModelService } from "../model.service";
import { SubquestionComponent } from "../subquestion/subquestion.component";
import { OptionGroupComponent } from "../option-group/option-group.component";

@Component({
  selector: 'question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css'],
})
export class QuestionComponent implements OnInit, AfterContentInit {

  @Input()
  no: string;

  @ContentChildren(SubquestionComponent)
  private subquestionCompList: QueryList<SubquestionComponent>;

  @ContentChildren(OptionGroupComponent)
  private optionGroupCompList: QueryList<OptionGroupComponent>;
  
  constructor(
    private modelService:ModelService
  ) { 
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    console.log(123)
    this.subquestionCompList.forEach(comp => {
      console.log('subquestion:', comp.no)
    });
    this.optionGroupCompList.forEach(comp => {
      console.log('option-group:', comp)
    });
  }

}

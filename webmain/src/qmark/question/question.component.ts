import { Component, Input, OnInit } from '@angular/core';
import { ContentChild } from '@angular/core';
import { ContentChildren, AfterContentInit, QueryList } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

import { Subscription }   from 'rxjs/Subscription';

import { QuestionModel } from "./question.model.service";
import { SubquestionComponent } from "../subquestion/subquestion.component";
import { OptionGroupComponent } from "../option-group/option-group.component";

import { BlankComponent } from "../blank/blank.component";

@Component({
  selector: 'question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QuestionModel]  
})
export class QuestionComponent implements OnInit, AfterContentInit {

  @Input()
  no: string;

  @ContentChildren(BlankComponent)
  private blankCompList: QueryList<BlankComponent>;


  @ContentChildren(SubquestionComponent)
  private subquestionCompList: QueryList<SubquestionComponent>;

  @ContentChildren(OptionGroupComponent)
  private optionGroupCompList: QueryList<OptionGroupComponent>;
  
  constructor(
    private questionModel: QuestionModel
  ) { }

  forEachBlank(fn: (blank: BlankComponent) => void): void {
    this.blankCompList.forEach(comp => {
      fn(comp);
    });

    this.subquestionCompList.forEach(comp => {
      comp.forEachBlank((blank) => {
        fn(blank);
      });
    });
  }

      
  ngOnInit() {
  }

  ngAfterContentInit() {
    this.forEachBlank(blank => {
      console.log('blank: ', blank);
    });

    // this.subquestionCompList.forEach(comp => {
    //   console.log('subquestion:', comp.no)
    // });
    // this.optionGroupCompList.forEach(comp => {
    //   console.log('option-group:', comp)
    // });
  }

}

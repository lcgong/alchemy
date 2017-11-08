import { Component, Input, OnInit } from '@angular/core';
import { ModelService } from "../model.service";

import { ContentChildren, AfterViewInit,  AfterContentInit, QueryList } from '@angular/core';

import { OptionGroupComponent } from "../option-group/option-group.component";


@Component({
  selector: 'subquestion',
  templateUrl: './subquestion.component.html',
  styleUrls: ['./subquestion.component.css']
})
export class SubquestionComponent 
  implements OnInit, AfterViewInit, AfterContentInit {
  
  @Input()
  no: string;

  @ContentChildren(OptionGroupComponent)
  private optionGroupCompList: QueryList<OptionGroupComponent>;


  constructor(
    private modelService:ModelService
  ) { 
    
  }

  ngOnInit() {

  }
  
  ngAfterViewInit() {

  }

  ngAfterContentInit() {
    // console.log(333);
    // this.optionGroupCompList.forEach(comp => {
    //   console.log('option-group:', comp)
    // });
  }
}

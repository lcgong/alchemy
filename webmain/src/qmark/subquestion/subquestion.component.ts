import { Component, Input, OnInit } from '@angular/core';
import { ModelService } from "../model.service";

import { ContentChildren, AfterViewInit,  AfterContentInit, QueryList } from '@angular/core';

import { OptionGroupComponent } from "../option-group/option-group.component";
import { BlankComponent } from "../blank/blank.component";


@Component({
  selector: 'subquestion',
  templateUrl: './subquestion.component.html',
  styleUrls: ['./subquestion.component.css']
})
export class SubquestionComponent 
  implements OnInit, AfterViewInit, AfterContentInit {
  
  @Input()
  no: string;

  @ContentChildren(BlankComponent)
  private blankCompList: QueryList<BlankComponent>;

  @ContentChildren(OptionGroupComponent)
  private optionGroupCompList: QueryList<OptionGroupComponent>;


  constructor(
    private modelService:ModelService
  ) { 
    
  }

  
  public forEachBlank(fn: (blank: BlankComponent) => void): void {
    this.blankCompList.forEach(comp => {
      fn(comp);
    });
  }
  
  ngOnInit() {
    
  }

  ngAfterViewInit() {

  }

  ngAfterContentInit() {
  }
};


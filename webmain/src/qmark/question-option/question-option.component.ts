import { Component, Input, OnInit } from '@angular/core';
import { ModelService } from "../model.service";

@Component({
  selector: 'question-option',
  templateUrl: './question-option.component.html',
  styleUrls: ['./question-option.component.css']
})
export class QuestionOptionComponent implements OnInit {

  @Input()
  no: string;

  constructor(
    // private modelService:ModelService
  ) { }

  ngOnInit() {

  }

  clickOption() {
    console.log('click', this.no)
  }
}

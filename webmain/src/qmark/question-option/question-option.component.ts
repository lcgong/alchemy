import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'question-option',
  templateUrl: './question-option.component.html',
  styleUrls: ['./question-option.component.css']
})
export class QuestionOptionComponent implements OnInit {

  @Input()
  no: string;
  // set data(value: string) {
  //     if(value){
  //         this._data = value;
  //         this.onDataChange(value);
  //     }
  // }

  constructor() { }

  ngOnInit() {
    console.log('no=', this.no);
  }

}

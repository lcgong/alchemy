import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'subquestion',
  templateUrl: './subquestion.component.html',
  styleUrls: ['./subquestion.component.css']
})
export class SubquestionComponent implements OnInit {
  
  @Input()
  no: string;

  constructor() { }

  ngOnInit() {
  }

}

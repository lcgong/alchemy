import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'question-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.css']
})
export class BlankComponent implements OnInit {

  @Input()
  no: string;

  constructor() { 
    
  }

  ngOnInit() {

  }

}

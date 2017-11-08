import { Component, OnInit } from '@angular/core';
import { ModelService } from '../model.service';

@Component({
  selector: 'solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.css']
})
export class SolutionComponent implements OnInit {

  constructor(
    private modelService:ModelService
  ) { 

  }

  ngOnInit() {
    
  }

}

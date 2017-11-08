import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ModelService } from "../model.service";
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'question-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.css']
})
export class BlankComponent implements OnInit {
  subscription: Subscription;

  @Input()
  no: string;

  constructor(
    private modelService:ModelService
  ) { 
    // this.subscription = questionService.missionAnnounced$.subscribe(
    //   mission => {
    //     this.mission = mission;
    //     this.announced = true;
    //     this.confirmed = false;
    // });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    // this.subscription.unsubscribe();
  }
}

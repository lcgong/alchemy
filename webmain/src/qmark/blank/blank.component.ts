import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { QuestionModel } from "../question/question.model.service";
import { Subscription }   from 'rxjs/Subscription';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'question-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  
})
export class BlankComponent implements OnInit {
  subscription: Subscription;

  @Input()
  no: string;

  constructor(
    private questionModel: QuestionModel
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

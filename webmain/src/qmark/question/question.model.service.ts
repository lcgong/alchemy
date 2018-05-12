import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

@Injectable()
export class QuestionModel {

  private blackActiveBlankSource = new Subject<number>();
  private optionChangedSource = new Subject<number[]>();

  private answers; // [[1], [3], [4,3]]
  private solutions; // [[]]
  
  constructor(
  ) {
    console.log('question-model: created');
  }

  public get activeBlank(): number {
    return null;
  }

  public set activeBlank(blankIdx: number) {
    this.blackActiveBlankSource.next(blankIdx);
  }

//  // Observable string sources
//  private missionAnnouncedSource = new Subject<string>();

//  // Observable string streams
//  missionAnnounced$ = this.missionAnnouncedSource.asObservable();
//  missionConfirmed$ = this.missionConfirmedSource.asObservable();

//  // Service message commands
//  announceMission(mission: string) {
//    this.missionAnnouncedSource.next(mission);
//  }

//  confirmMission(astronaut: string) {
//    this.missionConfirmedSource.next(astronaut);
//  }
}


// metainfos: [ metainfo1， metainfo2 ]
// metainfo: { 
//   blanks: [ blank_1, blank_2, ... ],
//   solutions: [ blank_1_sol, blank_2_sol, ... ],
//   optiongroup: [ optgrp_main, optgrp_subquest1, optgrp_subquest2, ... ] 
// }

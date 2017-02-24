
import { Component } from '@angular/core';

import {data as sample1} from "../data/p01.js"
import {data as sample2} from "../data/p02.js"

@Component({
  selector: 'test-app',
  template: `\
  <select >
    <option *ngFor="let sample of samples" [ngValue]="sample.data">
      {{ sample.title }}
    </option>
  </select>

  `
})
export class TestAppComp {
  samples = [
    { title:'P-01', data: sample1},
    { title:'P-02', data: sample2}
  ];
}

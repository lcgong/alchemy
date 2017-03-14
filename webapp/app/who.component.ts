import { NgModule, Component } from "@angular/core";

@Component({
  selector: 'who',
  template: `
    <div>
    Who are you?  <input [(ngModel)]="name">
    </div>
    <p *ngIf="name">Hello, {{name}}</p>
  `,
})
export class WhoComponent {
  name: string = '';

  constructor() {
    for (let i of [1,2,3]) {
      //
    }
  }
};

import { Component } from '@angular/core';

@Component({
  selector: 'caption',
  template: `<h1>Hello {{name}}</h1>`,
})
export class CaptionComponent  {
  name = 'Angular';
}

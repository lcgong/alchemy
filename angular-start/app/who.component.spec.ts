// import {describe, beforeEach, it, expect} from 'jasmine';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { BaseRequestOptions, Http, ConnectionBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { FormsModule } from '@angular/forms';
import { WhoComponent } from './who.component';

describe('WhoComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WhoComponent],
      imports: [FormsModule],
    }).compileComponents();
  }));

  let comp: WhoComponent;
  let fixture: ComponentFixture<WhoComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(WhoComponent);
    comp = fixture.componentInstance;
  });

  it('should create component', () => expect(comp).toBeDefined() );

  it('value set', () => {
    let inputEl: DebugElement;

    inputEl = fixture.debugElement.query(By.css('input'));
    expect(inputEl).toBeDefined();

    let pEl: DebugElement;

    inputEl.nativeElement.value = 'Tom Zhang';

      // dispatch a DOM event so that Angular learns of input value change.
    inputEl.nativeElement.dispatchEvent(newEvent('input'));

    // comp.name = 'Tom Zhang';
    //
    // fixture.detectChanges();

    inputEl = fixture.debugElement.query(By.css('input'));
    pEl = fixture.debugElement.query(By.css('p'));

    console.log(789, inputEl.nativeElement.value, pEl.nativeElement.textContent);

    expect(pEl.nativeElement.textContent).toContain(comp.name);

    // expect(inputEl.nativeElement.value).toContain('Tom Zhang');
  });
// //
// //   // it(`should have as title 'app works!'`, async(() => {
// //   //   const fixture = TestBed.createComponent(AppComponent);
// //   //   const app = fixture.debugElement.componentInstance;
// //   //   expect(app.title).toEqual('app works!');
// //   // }));
// //
// //   // it('should render title in a h1 tag', async(() => {
// //   //   const fixture = TestBed.createComponent(AppComponent);
// //   //   fixture.detectChanges();
// //   //   const compiled = fixture.debugElement.nativeElement;
// //   //   expect(compiled.querySelector('h1').textContent).toContain('app works!');
// //   // }));
});

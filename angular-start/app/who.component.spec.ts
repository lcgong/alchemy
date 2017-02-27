// import {describe, beforeEach, it, expect} from 'jasmine';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { By }  from '@angular/platform-browser';

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

  console.log('see test');

  let comp: WhoComponent;
  let fixture: ComponentFixture<WhoComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WhoComponent);
    comp = fixture.componentInstance;
    // de = fixture.debugElement.query(By.css('h1'));
  });

  it('should create component', () => expect(comp).toBeDefined() );

  it('should have expected <h1> text', () => {
    // fixture.detectChanges();
    // const h1 = de.nativeElement;
    // expect(h1.innerText).toMatch(/angular/i,
    //   '<h1> should say something about "Angular"');
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

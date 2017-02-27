// //
import {inject} from '@angular/core/testing';
console.log(inject)
import { TestBed, async } from '@angular/core/testing';
// import {it, describe, expect, inject, fakeAsync, beforeEachProviders, tick} from 'angular2/testing';


import { WhoComponent } from './who.component';
// import { StormpathModule, Stormpath } from 'angular-stormpath';
import {MainModule} from "./main.module";
import { BaseRequestOptions, Http, ConnectionBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';



describe('WhoComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        WhoComponent
      ],
      imports: [MainModule],
      providers: [
        // {
        //   provide: Http, useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
        //   return new Http(backend, defaultOptions);
        //   },
        //   deps: [MockBackend, BaseRequestOptions]
        // },
        {provide: MockBackend, useClass: MockBackend},
        // {provide: BaseRequestOptions, useClass: BaseRequestOptions}
      ]
    });
    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(WhoComponent);
    // const app = fixture.debugElement.componentInstance;
    // expect(app).toBeTruthy();
  }));
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

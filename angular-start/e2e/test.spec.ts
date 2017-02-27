
// import { describe, beforeEach } from 'jasmine';
// import {browser} from '@angular/core'

declare var browser: any; // ProtractorBrowser

describe('Protractor Demo App', function() {
  it('should have a title', function() {
    browser.get('http://localhost:8800/');
    expect(browser.getTitle()).toEqual('Angular Project Start');
  });
});

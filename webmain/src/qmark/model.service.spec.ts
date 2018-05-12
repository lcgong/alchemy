import { TestBed, async, inject } from '@angular/core/testing';

import { MockBackend } from '@angular/http/testing';
import { ModelService } from './model.service';
import { Observable } from 'rxjs/Observable';


beforeEach(()=>{
  TestBed.configureTestingModule({
    imports: [],
    providers: [
      ModelService,
      MockBackend,
    ]
  });
});

describe('Qmark Model Service',()=>{
  let modelService: ModelService;
  let mockBackend: MockBackend;

  beforeEach(() => {
    modelService = TestBed.get(modelService);
    mockBackend = TestBed.get(MockBackend);
  });


  it('parse markdown code', () => {

    let data = `
    `;

    let tokens = this.markdownService.parse(data);
    
    let state = {
      blanks: {}
    };

    let questions = [];
    let treepath  = [0];
    this.analyze(tokens, treepath, questions, -1);    

    // modelService.compile(mockSrc);

  });

});

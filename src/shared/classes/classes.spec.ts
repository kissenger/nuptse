import { TestBed } from "@angular/core/testing";
import { Method } from "./method.class";
import { Practice } from "./practice.class";
import { METHODS_DB } from "../methods.lib";

// Straight Jasmine testing without Angular's testing support
describe('Practice Class', () => {
  let mockPracticeService = {};
  let practiceClass: Practice;
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [{ useValue:  mockPracticeService}]});
    practiceClass = new Practice(['Cambridge Surprise Major'], 4);
  });

  it('get method should return a Method instance', () => {
    // @ts-ignore:
    expect(practiceClass._getMethods(['Cambridge Surprise Major']).every(x => x instanceof Method)).toBeTrue();
  });

  it('get calls', () => {
    const methods = METHODS_DB.filter(m => !!m.unitTest);

    // @ts-ignore:
    expect(practiceClass._getMethods(methods.map(m => m.name)).every( (x,i) => x._getCalls === methods.unitTest[i])).toBeTrue();
  });

});
import { MethodsArray, MethodDescriptorsArray, PracticeOptions, PlacebellArray, Row, Calls, Bell, Rows, Sequence, TouchCall } from "../types";
import { Method } from "./method.class";
import { MethodList } from "./methodList.class";
import { Utility } from "./utilities.class";

export class Practice {

  private _rowNumber: number; //row number within lead end
  private _methods: MethodsArray;
  private _currentMethod: Method;
  private _nextMethod: Method | null = null;
  private _numberOfBells: number;
  private _workingBell: Bell;
  private _options: PracticeOptions;
  private _plainCounter: number = 0;
  private _leadsPerCourse: number;
  private _rows: Rows;
  private _roundsArray: Sequence;
  private _leadHead: Sequence;
  private _CALL_OFFSET  = -3; 
  
  constructor(methodsList: MethodList, options: PracticeOptions) {
    this._methods = methodsList.list.map(m=>new Method(m));
    this._currentMethod = this._methods[0];
    this._options = options;
    this._rowNumber = -1;     // row number in lead (resets to 0 at each lead end)
    this._numberOfBells = this._methods[0].numberOfBells;
    this._workingBell = this._getWorkingBell(this._options.workingBell);
    this._roundsArray = Utility.getRoundsArray(this.numberOfBells);
    this._leadHead = this._roundsArray;
    this._leadsPerCourse = this._methods[0].leadsPerCourse;
    this._rows = this._getLead(this._roundsArray);
  }

  /*
  * Small functions
  */
  public get numberOfBells()       { return this._numberOfBells; }
  public get workingBell()         { return this._workingBell; }
  public get huntBells()           { return this._currentMethod.huntBells};
  public get roundsArray()         { return this._roundsArray };
  public get bellsThatAreHunting() { return this._currentMethod.huntBells.map(hb=>this._leadHead[parseInt(hb)-1]); }
  public get wbMovement(): number  { 
    let iNext = this._getBellPlace(this._workingBell, this._rowNumber+1);
    let iThis = this._getBellPlace(this._workingBell, this._rowNumber);
    return iNext - iThis
  } 
  private _getBellPlace(bell: Bell, rowNumber: number): number { return this._rows[rowNumber].sequence.indexOf(bell)};
  public isBellInTheHunt(bell: Bell): boolean { return this.bellsThatAreHunting.includes(bell) };
  public isWorkingBell(bell: Bell): boolean   { return this._workingBell === bell };

  /*
  * Get all the rows in the next leadend, complete with calls and flags 
  */
  private _getLead(leadHead: Sequence): Rows {

    // Determine calls for this lead - touchcalls first, then method calls
    // Need to know what the touch call is first, as for a principal we only change
    // the method when the treble is leading at the LE, so first we 
    // (1) Find the touch calls that apply for this leadend
    // (2) Get the leadend with the touch calls applied
    // (3) Determine whether a change of method is needed
    //     (a) If method is a principle, only change method if the treble is leading at the next leadend
    //     (b) Otherwise, change the method based on rolling the dice
    // (4) Once all calls are known, add then to the rows array and return

    // First get touch calls for this lead
    const calls: Calls = this._currentMethod.touchEffectRows.map( r => 
      ({effectRow: r, callRow: Math.max(0, r + this._CALL_OFFSET), call: this._getTouchCall(this._options)})
    );

    // Once the relevant touch calls are established, get the full lead
    let rows: Rows = this._currentMethod.getLead(calls, leadHead);

    // Now check for method type and apply logic to change method
    this._nextMethod = null;
    if (this._currentMethod.isPrinciple) {
      if (this._isTrebleLeadingAtLeadend(rows)) {    // nested if to avoid running function when not a principle
        this._nextMethod = this._getNextMethod();    
      }
    } else {
      if (this._shouldMethodChange()) {
        this._nextMethod = this._getNextMethod();
      }
    }
    
    // If method has changed, update row to include method call
    if (this._nextMethod) {
      const methodCallRow = this._currentMethod.touchEffectRows.slice(-1)[0];  // last call row if multiple eg stedman
      calls.push({callRow: methodCallRow, call: this._nextMethod.shortName});
    }
  
    // If this is the first leadend, call the starting method
    if (this._rowNumber < 0) {
      calls.push({callRow: 0, call: `GO ${this._currentMethod.shortName}`});
    }

    // put the calls on the rows and return
    rows = this._currentMethod.addCallsToLead(calls, rows);
    console.log(rows)
    return rows;
  }

  /*
  *  Step through leadend (increment row number and get next change)
  */
  public step(): Row {

    this._rowNumber++;
    if (this._rowNumber === this._rows.length - 1) {   // not triggered for first row of practice session
      this._rowNumber = 0;
      if (this._nextMethod) this._currentMethod = this._nextMethod;
      this._leadHead = this._rows[this._rows.length - 1].sequence;
      this._rows = this._getLead(this._leadHead);
    }

    return this._rows[this._rowNumber];

  }

  /*
  *  Randomly generate null, bob or single
  */
  private _getTouchCall(options: PracticeOptions): TouchCall {

    // increase the likelyhood of a call with each passing plain lead, 
    // unless its the hunt bell in which case make a call
    let call: TouchCall = null;
    let array: Array<TouchCall> = []

    if (this._linearChance || this.isBellInTheHunt(this._workingBell)) {
      if (options.bobs && !this._currentMethod.noBobsFlag) array.push('bob');
      else if (options.singles) array.push('single');

      if (array.length === 0) call = null;
      else if (array.length === 1) call = array[0];
      else {
        const rand = Utility.randomInteger(0,100);
        if (rand < 70) call = 'bob';
        call = 'single'
      }
    }

    return call;
  }

  /*
  *  Returns true if the treble is leading at the end of the current lead
  */
  private _isTrebleLeadingAtLeadend(rows: Rows): Boolean {
    return rows[rows.length - 1].sequence[0] === '1';
  }

  /*
  *  Increasing chance of returning true with each passing leadend (threshold reduces with each lead)
  *  Resets after a true is returned
  */
  private get _linearChance(): Boolean {
    const MULTIPLIER = 1.3;
    const threshold = Math.floor(this._leadsPerCourse - MULTIPLIER * this._plainCounter++);
    const result = this._staticChance(threshold);
    if (result) this._plainCounter = 0;
    return result;
  }

  /*
  *  Returns true if D10 roll is greater than supplied threshold
  */
  private _staticChance(threshold: number): boolean {
    const result = Utility.randomInteger(1,10);
    // console.log(`Rolled: ${result}, Threshold: ${threshold}, Result: ${result > threshold} `)
    return result > threshold;
  }

  /*
  *  Returns true if the current method should change based on dice roll
  */
  private _shouldMethodChange() {
    return this._methods.length > 1 && this._staticChance(6);
  }

  /*
  *  Select at random another method in the list, ensuring that the current method is not included
  *  Returns null if method should not be changed
  */
  private _getNextMethod() {
    const filteredMethods = this._methods!.filter(m => m.name !== this._currentMethod!.name);
    const newMethod = filteredMethods[Utility.randomInteger(0, filteredMethods.length-1)];
    return newMethod;
  }

  private _getWorkingBell(input: string): Bell {
    if (input === 'Random') {
      const wb = Utility.randomInteger(this._currentMethod.huntBells.length + 1, this.numberOfBells);
      return Utility.numbToChar(wb);
    } else {
      return <Bell>input;
    }    
  }

}
import { Call } from "@angular/compiler";
import { MethodsArray, MethodDescriptorsArray, PracticeOptions, PlacebellArray, Row, Calls, Bell, Rows, Sequence, TouchCall } from "../types";
import { Method } from "./method.class";
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
  
  constructor(methods: MethodDescriptorsArray, options: PracticeOptions) {
    this._methods = methods.map(m=>new Method(m));
    this._currentMethod = this._methods[0];
    this._options = options;
    this._rowNumber = -1;     // row number in lead (resets to 0 at each lead end)
    this._numberOfBells = this._methods[0].numberOfBells;
    this._workingBell = this._getWorkingBell(this._options.workingBell);
    this._roundsArray = Utility.getRoundsArray(this.numberOfBells);
    this._leadHead = this._roundsArray;
    this._leadsPerCourse = this._methods[0].leadsPerCourse;
    this._rows = this._getLead(this._roundsArray, true);
  }

  // Small functions
  public get isLeadHead()          { return this._rowNumber === this._currentMethod.leadLength }
  public get isLeadEnd()           { return this._rowNumber === this._currentMethod.leadLength - 1; }
  public get numberOfBells ()      { return this._numberOfBells; }
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
  * Get all the Rows in the next leadend, complete with calls and specific flags 
  */
  private _getLead(leadHead: Sequence, isFirstLead?: boolean): Rows {

    // determine calls for this lead and calculate rows
    const CALL_OFFSET  = -3;   

    // get this leadend with only touchcalls implemented, as we need to know the leadend in order
    // to determine if a method change is required (only applicable if its a principle)
    const calls: Calls = new Map(this._currentMethod.touchEffectRows.map( r => [r, this._getCall(this._options)]));
    const placeBells: PlacebellArray = this._currentMethod.getPlaceBells(calls);
    const rows: Rows = this._currentMethod.getLead(placeBells, leadHead);

    // put touch calls and flags on the Rows
    calls.forEach( (call, rowNumber) => rows[rowNumber + CALL_OFFSET < 0 ? 0 : rowNumber + CALL_OFFSET].call = call );
    rows[rows.length - 1].isLeadend = true;
    rows[0].isLeadhead = true;

    // manage change of method
    if (this._currentMethod.isPrinciple && this._isTrebleLeadingAtLeadend(rows)) {
      this._nextMethod = this._getRandomMethod;    // force method change
    } else if (!this._currentMethod.isPrinciple) {
      this._nextMethod = this._getNextMethod;      // change that method will remain unchanged
    }
    
    // update rows with method calls
    if (isFirstLead) rows[0].call = `GO ${this._currentMethod.shortName}`;
    if (this._nextMethod) {
      const methodCallRow = this._currentMethod.touchEffectRows.slice(-1)[0] + CALL_OFFSET + 1;
      rows[methodCallRow].call = this._nextMethod.shortName;
    }

    return rows;
  }

  /*
  *  Step through leadend (increment row number and get next change)
  */
  public step(): Row {

    this._rowNumber++;
    if (this.isLeadHead) {   // not triggered for first row of practice session
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
  private _getCall(options: PracticeOptions): TouchCall {

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

    this._plainCounter = call ? 0 : this._plainCounter + 1;
    return call;
  }

  private get _linearChance(): Boolean {
    const rand = Utility.randomInteger(0,80);
    const thresh = 100 / this._leadsPerCourse * (this._plainCounter + 1);
    console.log(`Touch Call: Rolled ${rand}, threshold is ${thresh}`)
    return rand < thresh;
  }

  private _isTrebleLeadingAtLeadend(rows:Rows): Boolean {
    return rows[rows.length - 1].sequence[0] === '1';
  }


  /*
  *  Randomly change the method in two steps
  *  1) role the dice to determine whether the method should change
  *  2) role the dice to determine which method to change to 
  *  This ensures that you dont necessarily change methods every lead, and get a few leads 
  */
  private get _getNextMethod(): Method | null {

    if (this._methods.length > 1) {
      const random = Utility.randomInteger(1,10);
      const thresh = 6;
      console.log(`Method change - rolled a ${random}, threshold is ${thresh}`);
      if (random > thresh) {
        return this._getRandomMethod;
      }
    }
    return null;
  }

  /*
  *  Select at random another method in the list
  */
  private get _getRandomMethod() {
    const arr = this._methods!.filter(m => m.name !== this._currentMethod!.name);
    const newMethod = arr[Utility.randomInteger(0, arr.length-1)];
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
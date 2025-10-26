import { MethodsArray, MethodDescriptorsArray, RowToPrint, PracticeOptions } from "../types";
import { Method } from "./method.class";
import { Utility } from "./utilities.class";

export class Practice {

  private _rowNumber: number; //row number within lead end
  private _methods: MethodsArray;
  private _currentMethod: Method;
  private _nextMethod: Method;
  private _currentRow: Array<string> = [];
  private _nextRow: Array<string> = [];
  private _call?: null|'bob'|'single';
  private _numberOfBells: number;
  private _workingBell: string;
  private _options: PracticeOptions;
  private _isFirstFlag = true;
  private _plainLeadendCounter: number = 0;
  private _leadsPerCourse: number;
  
  constructor(methods: MethodDescriptorsArray, options: PracticeOptions) {
    this._methods = methods.map(m=>new Method(m));
    this._currentMethod = this._methods[0];
    this._nextMethod = this._getNextMethod;
    this._options = options;
    this._rowNumber = -1;     // row number in lead (resets to 0 at each lead end)
    this._numberOfBells = this._methods[0].numberOfBells;
    this._workingBell = this._getWorkingBell(this._options.workingBell);
    this._nextRow = Utility.getRoundsArray(this._numberOfBells);  //this will become _currentRow when step() is called 
  
    // used to ensure there is at least one touch call per 'course'
    this._leadsPerCourse = this._methods[0].leadsPerCourse;
  }

  // Public getters and setters 
  public get isLeadHead()      { return this._rowNumber <= 0; }
  public get isLeadEnd()       { return this._rowNumber === this._currentMethod.leadLength - 1; }
  public get isMethodCallRow() { return this._rowNumber === this._currentMethod.leadLength - 2; }
  public get isCallRow()       { return this._rowNumber === this._currentMethod.leadLength - 3; }
  public get numberOfBells ()  { return this._numberOfBells; }
  public get workingBell()     { return this._workingBell; }
  public get wbMovement()      { return this._nextRow.indexOf(this._workingBell) - this._currentRow.indexOf(this._workingBell); } 
 
  // Step through leadend (increment row number and get next change)
  public step(): RowToPrint {

    let callString: string | null = null;
    this._rowNumber = this.isLeadEnd ? 0 : this._rowNumber + 1;
    this._currentRow = this._nextRow;
    
    if (this.isLeadHead) {
      if (this._isFirstFlag) {
        callString = 'Go ' + this._currentMethod?.name;
        this._isFirstFlag = false;
      } else {
        this._currentMethod = this._nextMethod;
        this._nextMethod = this._getNextMethod;
      }

      const isHuntBell = this._checkHuntBell();
      this._call = this._getCall(this._options, isHuntBell);

      if (!this._call) this._plainLeadendCounter++;
      else this._plainLeadendCounter = 0;
    } 

    const placeBells = this._currentMethod.getPlaceBells(this._rowNumber, this._call!);
    this._nextRow = this._currentMethod.transformRow(this._currentRow, placeBells!);

    if (this.isCallRow) {
      callString = this._call!;
    }

    if (this.isMethodCallRow) {
      if (this._currentMethod.name !== this._nextMethod.name) {
        callString = this._nextMethod.name.split(' ')[0];
      }
    }

    return {sequence: this._currentRow, isLeadEnd: this.isLeadEnd, call: callString}

  }

  /*
  *  Randomly generate plain, bob or single
  */
  private _getCall(options: PracticeOptions, isHuntBell: boolean) {
    // increase the likelyhood of a call with each passing plain lead, 
    // unless its the hunt bell in which case make a call
    if (options.bobs || options.singles) {
      // const rand = Utility.randomInteger(0,100);
      // const threshold = 100 / this._leadsPerCourse * (this._plainLeadendCounter + 1);
      if (this._linearChance() || isHuntBell) {
        if (options.bobs && !options.singles) return 'bob';
        else if (!options.bobs && options.singles) return 'single';
        else {
          const rand = Utility.randomInteger(0,100);
          if (rand < 70) return 'bob';
          return 'single'
        }
      }
    }
    return null;
  }

  private _linearChance() {
    const rand = Utility.randomInteger(0,1);
    const thresh = 1 - (1 / this._leadsPerCourse * (this._plainLeadendCounter + 1));
    console.log(`rand: ${rand}\nthresh: ${thresh}`)
    return rand > thresh;
  }


  // private _exponentialChance() {

  //   // Calculate the constant base of the exponential function
  //   const MAX_ITER = this._leadsPerCourse;
  //   const BASE_CHANCE = 0.1;  // 10% change of success on first iteration
  //   const DECAY_FACTOR = 0.5;
  //   const baseFactor = 1 - BASE_CHANCE;
  //   const chanceToFail = Math.pow(baseFactor, (this._plainLeadendCounter+1));

  //   const rand = Math.random();
  //   console.log(`rand: ${rand}\nthresh: ${chanceToFail}`)

  //   if (this._plainLeadendCounter === MAX_ITER) return true;
  //   else return rand > chanceToFail;

  // }
  /*
  *  Randomly change the method in two steps
  *  1) role the dice to determine whether the method should change
  *  2) role the dice to determine which method to change to 
  *  This ensures that you dont necessarily change methods every lead, and get a few leads 
  */
  private get _getNextMethod(): Method {
    if (this._methods.length > 1) {
        if (Utility.randomInteger(1,10) > 6) {
          const arr = this._methods!.filter(m => m.name !== this._currentMethod!.name);
          return arr[Utility.randomInteger(0, arr.length-1)];
        }
    }
    return this._currentMethod;
  }

  private _getWorkingBell(input: string): string {
    if (input === 'Random') {
      const wb = Utility.randomInteger(this._currentMethod.huntBells.length + 1, this.numberOfBells);
      return Utility.numbToChar(wb);
    } else {
      return input;
    }    
  }

  private _checkHuntBell () {
    const huntBells: Array<string> = this._currentMethod.huntBells;
    const workingBellPlace: string = (this._currentRow.indexOf(this._workingBell) + 1).toString();
    return huntBells.indexOf(workingBellPlace) > 0;
  }
}
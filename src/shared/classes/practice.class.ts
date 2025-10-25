import { MethodsArray, MethodDescriptorsArray, CallsObject, RowToPrint } from "../types";
import { Method } from "./method.class";
import { Utility } from "./utilities.class";

export class Practice {

  private _rowNumber: number; //row number within lead end
  private _methods: MethodsArray;
  private _currentMethod: Method;
  private _nextMethod: Method;
  private _currentRow: Array<string> = [];
  private _nextRow: Array<string> = [];
  private _call: 'plain'|'bob'|'single';
  private _numberOfBells: number;
  private _workingBell: string;
  private _callProbabilities: CallsObject;
  private _isFirstFlag = true;
  
  constructor(methods: MethodDescriptorsArray, calls: CallsObject, workingBell: string) {
    if (methods.length === 0) throw Error("Error from Practice class: No items in methods array");
    this._methods = methods.map(m=>new Method(m));
    this._currentMethod = this._methods[0];
    this._nextMethod = this._getNextMethod;
    this._callProbabilities = calls;
    this._call = this._getCall;
    this._workingBell = workingBell;
    this._rowNumber = -1;     // row number in lead (resets to 0 at each lead end)
    this._numberOfBells = this._methods[0].numberOfBells;
    this._nextRow = Utility.getRoundsArray(this._numberOfBells);  //this will become _currentRow when step() is called 
  }

  // Public getters and setters 
  public get isLeadHead()      { return this._rowNumber <= 0; }
  public get isLeadEnd()       { return this._rowNumber === this._currentMethod!.leadLength - 1; }
  public get isMethodCallRow() { return this._rowNumber === this._currentMethod!.leadLength! - 2; }
  public get isCallRow()       { return this._rowNumber === this._currentMethod!.leadLength! - 3; }
  public get numberOfBells ()  { return this._numberOfBells!; }
  public get wbMovement()      { return this._nextRow.indexOf(this._workingBell) - this._currentRow.indexOf(this._workingBell); } 
 

  // Step through leadend (increment row number and get next change)
  public step(): RowToPrint {

    let currentCall: string | null = null;
    this._rowNumber = this.isLeadEnd ? 0 : this._rowNumber + 1;

    if (this.isLeadHead) {
      if (this._isFirstFlag) {
        currentCall = 'Go ' + this._currentMethod?.name;
        this._isFirstFlag = false;
      } else {
        this._currentMethod = this._nextMethod;
        this._nextMethod = this._getNextMethod;
      }
      this._call = this._getCall;
    } 

    if (this.isCallRow) {
      currentCall = this._call === 'plain' ? '' : this._call;
    }

    if (this.isMethodCallRow) {
      if (this._currentMethod.name !== this._nextMethod.name) {
        currentCall = this._nextMethod.name.split(' ')[0];
      }
    }

    this._currentRow = this._nextRow;
    const placeBells = this._currentMethod.getPlaceBells(this._rowNumber, this._call);
    this._nextRow = this._currentMethod.transformRow(this._currentRow, placeBells!);

    return {sequence: this._currentRow, isLeadEnd: this.isLeadEnd, call: currentCall}

  }

  /*
  *  Randomly generate plain, bob or single
  */
  private get _getCall() {
    // console.log(this._currentMethod)
    const rand = Utility.randomInteger(0,100);
    if (rand < this._callProbabilities.plain) return 'plain';
    if (rand < this._callProbabilities.plain + this._callProbabilities.bobs) return 'bob';
    return 'single';
  }

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

}
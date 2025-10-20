import { MethodsArray, MethodDescriptorsArray, CallsObject, RowToPrint } from "../types";
import { Method } from "./method.class";

export class Practice {

  private _rowNumber: number; //row number within lead end
  private _methods: MethodsArray;
  private _currentMethod: Method|undefined;
  private _nextMethod: Method|undefined;
  private _currentRow: Array<number> = [];
  private _nextRow: Array<number> = [];

  private _numberOfBells: number;
  private _workingBell: number;
  private _calls: CallsObject;
  private _touchCall: 'plain'|'bob'|'single' = 'plain';

  
  constructor(methods: MethodDescriptorsArray, calls: CallsObject, workingBell: number) {
    if (methods.length === 0) throw Error("Error from Practice class: No items in methods array");
    this._methods = methods.map(m=>new Method(m));
    this._calls = calls;
    this._workingBell = workingBell;
    this._numberOfBells = this._methods[0].numberOfBells;
    this._rowNumber = -1;     // row number in lead (resets to 0 at each lead end)
    this._nextRow = this._getFirstRow;  //this will become _currentRow when step() is called  
  }

  // Public getters and setters 
  public get isLeadHead() { return this._rowNumber <= 0; }
  // public get isLeadEnd()  { 
  //   if (!this._currentMethod) return false;
  //   return this._rowNumber === this._currentMethod.leadLength - 1; 
  // }
  public get isLeadEnd()  { 
    if (!this._currentMethod) return false;
    return this._rowNumber === this._currentMethod.leadLength - 1; 
  }
  public get isCallRow()  { return this._rowNumber === this._currentMethod!.callPosition; }
  public get isMethodChangeRow()  { return this._rowNumber === this._currentMethod!.callPosition + 1; }
  public get workingBellNextMove() { 
    const a = this._currentRow.findIndex(e=>e===this._workingBell);
    const b = this._nextRow.findIndex(e=>e===this._workingBell); 
    return b-a;
  } 
  public get numberOfBells () { return this._numberOfBells; }

  // Step through leadend (increment row number and get next change)
  public step(): RowToPrint {

    let callString: string = '';

    this._rowNumber = this.isLeadEnd ? 0 : this._rowNumber + 1;


    if (this.isLeadHead) {
      if (!this._currentMethod) {
        this._currentMethod = this._methods[0]; 
        callString = 'Go ' + this._currentMethod.name;
      } else {
        this._currentMethod = this._nextMethod;
      }
      this._nextMethod = this._getNextMethod;
    } 
    if (this.isCallRow) callString = this._getTouchCall;
    if (this.isMethodChangeRow) {
      if (this._nextMethod!.name !== this._currentMethod?.name) {
        callString = this._nextMethod!.name.split(' ')[0];
      }   
    }

    this._currentRow = this._nextRow;
    this._nextRow = this._getNextRow;

    return {sequence: this._currentRow, isLeadEnd: this.isLeadEnd, call: callString}

  }

  /*
  *   Get the place bell array for the next row, from the active method instance  
  */
  private _getPlaceBellArray(call: 'plain'|'bob'|'single') {
    // const nextRowNumber = this._rowNumber + 1 === this._currentMethod?.leadLength ? 0 : this._rowNumber + 1;
    return this._currentMethod!.placebells(this._rowNumber, call);
  }

  /*
  * Returns row of rounds for the present stage, eg [1,2,3,4,5,6,7,8] for Major
  */
  private get _getFirstRow() {
    return Array.from({length: this._numberOfBells}, (v,i) => i+1);
  }

  /*
  Transform a given row eg [1,2,3,4] by given place array eg [2,3] results in [1,3,2,4]
  */
  private get _getNextRow() {
    let modifier = 0;
    const transformedRow: Array<number> = [];
    const placeBells = this._getPlaceBellArray(this._touchCall);
    this._currentRow.forEach( (bellNumber, place) => {
      if (placeBells.includes(place+1)) modifier = 0;
      else modifier = modifier <= 0 ? 1 : -1;
      transformedRow.push(this._currentRow[place+modifier])
    })
    return transformedRow;
  }

  /*
  *  Randomly generate plain, bob or single
  */
  private get _getTouchCall() {
    const rand = this._randomInteger(0,100);
    if (rand < this._calls.plain) return 'plain';
    else if (rand < this._calls.plain + this._calls.bobs) return 'bob';
    return 'single';
  }

  /*
  *  Randomly change the method, only returning string if the new method is different
  */
  private get _getNextMethod(): Method {
    return this._methods[this._randomInteger(0,this._methods.length-1)];
  }

 

  private _randomInteger(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
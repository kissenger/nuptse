import { ActiveMethods, MethodDescriptor, Options } from "../types";
import { Method } from "./method.class";
import { METHODS_DB } from "../methods.lib";

export class Practice {

  private _methods: ActiveMethods;
  private _activeMethod: Method | undefined;
  private _rowNumber: number = -1; //row number within lead end
  private _currentRow: Array<number> = [];
  private _nextRow: Array<number> = [];
  private _numberOfBells: number;
  private _workingBell: number;
  

  constructor(methods: Array<string>, workingBell: number) {
    this._methods = this._getMethods(methods);
    this._workingBell = workingBell;
    this._setActiveMethod();
    this._numberOfBells = this._activeMethod!.numberOfBells;
    this.nextChange();
  }

  public get isLeadHead() {
    return this._rowNumber <= 0;
  }

  public get isLeadEnd() {
    return this._rowNumber === this._activeMethod!.leadLength - 1;
  }

  public get isCallRow() {
    return this._rowNumber === this._activeMethod?.leadLength;
  }

  public get currentRow() {
    return this._currentRow;
  }

  /*
  * Returns an array of Method class instances from list of abbreviations, eg 'CYMiPb'
  */
  private _getMethods(methodNames: Array<string>): ActiveMethods {
    const ams: ActiveMethods = [];

    methodNames.forEach( (thisMethod: string) => {
      try {
        let m: MethodDescriptor | undefined = METHODS_DB.find(method => method.name === thisMethod);
        if (m === undefined) {
          throw Error('Warning: Method abbreviation not found: ' + thisMethod);
        }
        ams.push(new Method(m));
      } catch (error) {
        console.log(error);
      }
    })
    return ams;
  }

  public nextChange() {
    if (this._rowNumber === -1) {
      this._currentRow = this._firstRow();
      this._rowNumber = 0;
    } else {
      this._currentRow = this._nextRow;
    }
    this._applyTransform();
    if (this._rowNumber === this._activeMethod?.leadLength! - 1) {
      this._rowNumber = 0;
    } else {
      this._rowNumber++;
    }
  }


  private _getPlaceBells() {
    return this._activeMethod!.getChanges(this._rowNumber, 'bob');
  }

  public get nextRow() {
    return this._currentRow;
  }

  private _setActiveMethod() {
    const name = this._methods[0].name;
    this._activeMethod = this._methods.find(method => method.name === name)
  }

  /*
  * Returns first row of method
  */
  private _firstRow() {
    return Array.from({length: this._numberOfBells}, (v,i) => i+1);
  }

  /*
  Transform a given row eg [1,2,3,4] by given place array eg [2,3] results in [1,3,2,4]
  */
  private _applyTransform() {
    let modifier = 0;
    const transformedRow: Array<number> = [];
    const placeBells = this._getPlaceBells();
    this._currentRow.forEach( (bellNumber, place) => {
      if (placeBells.includes(place+1)) {
        modifier = 0;
      } else {
        modifier = modifier <= 0 ? 1 : -1;
      }
      transformedRow.push(this._currentRow[place+modifier])
    })
    this._nextRow = transformedRow;
  }

  public correctKeyPress() {
    const a = this._currentRow.findIndex(e=>e===this._workingBell);
    const b = this._nextRow.findIndex(e=>e===this._workingBell);
    console.log(this._workingBell,a, b)
    if (a === b) return "ArrowLeft";
    if (b < a)   return "ArrowDown";
    else return "ArrowRight";
  }
}
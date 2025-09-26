import { ActiveMethods, MethodDescriptor, Options } from "../types";
import { Method } from "./method.class";
import { METHODS_DB } from "../methodsLib";

export class Practice {

  private _methods: ActiveMethods;
  private _activeMethod: Method | undefined;
  private _rowNumber: number = -1; //row number within lead end
  private _currentRow: Array<number> = [];
  private _nextRow: Array<number> = [];
  private _numberOfBells: number;
  private _workingBell: number;
  

  constructor(methodString: string, workingBell: number) {
    this._methods = this._getMethods(methodString);
    this._workingBell = 4;
    this._setActiveMethod();
    this._numberOfBells = this._activeMethod!.numberOfBells;
    this.nextChange();
  }

  public get isLeadHead() {
    return this._rowNumber <= 0;
  }

  public get currentRow() {
    return this._currentRow;
  }

  /*
  * Returns an array of Method class instances from list of abbreviations, eg 'CYMiPb'
  */
  private _getMethods(inputString: string): ActiveMethods {
    const abbrs: Array<string> = inputString.split(/(?=[A-Z])/);
    const ams: ActiveMethods = [];

    abbrs.forEach( (abbr: string) => {
      try {
        let m: MethodDescriptor | undefined = METHODS_DB.find(method => method.abbr === abbr);
        if (m === undefined) {
          throw Error('Warning: Method abbreviation not found: ' + abbr);
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
    if (this._rowNumber === this._activeMethod?.changesPerLead! - 1) {
      this._rowNumber = 0;
    } else {
      this._rowNumber++;
    }
  }

  private _getPlaceBells() {
    return this._activeMethod!.getPlaceBells('plain', this._rowNumber);
  }

  public get nextRow() {
    return this._currentRow;
  }

  private _setActiveMethod() {
    const abbr = this._methods[0].abbr;
    this._activeMethod = this._methods.find(method => method.abbr === abbr)
  }

  /*
  * Returns first row of method, with hidden places shown as 0
  */
  private _firstRow() {
    const row: Array<number> = [];
    for (let i = 1; i <= this._numberOfBells; i++) {
      row.push(i);
      // if (i === 1 || i === this._workingBell) row.push(i);
      // else row.push(0)
    }
    return row;
  }

  /*
  Transform a given row eg [1,2,3,4] by given place array eg [2,3] results in [1,3,2,4]
  */
  public _applyTransform() {
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



}
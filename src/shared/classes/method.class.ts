
import { ActiveMethods, MethodDescriptor, placeNotationArray } from "../types";


export class Method {
  private _name: string;
  private _stage: string;
  private _numberOfBells: number;
  // private _callOffset: number;
  private _leadLength: number;
  private _abbr: string;
  private _changesPerLead: number;
  private _plainLead: placeNotationArray;

  constructor(method: MethodDescriptor) {
    this._name = method.name;
    this._plainLead = this._getPlaceNotationArray(method.notation);
    this._stage = method.stage;
    this._numberOfBells = this._getNumberOfBells(method.stage);
    // this._callOffset = Math.max(this._bobNotation.length, this._singleNotation.length);
    this._changesPerLead = this._plainLead.length
    this._leadLength = this._changesPerLead + 1;
    this._abbr = method.abbr;
  }

  public getPlaceBells(callType: 'plain' | 'bob' | 'single', row: number) {
    return this._plainLead[row];
  }

  public get changesPerLead() {
    return this._changesPerLead;
  }
  public get numberOfBells() {
    return this._numberOfBells;
  }

  public get abbr() {
    return this._abbr;
  }

  public get stage() {
    return this._stage;
  }

  /*
  * Replace the lasts elements in place array to give full bob or single leadend notation
  */
  // private _applyCall(notationString: string) {
  //   let callNotation = this._getPlaceNotationArray(notationString);
  //   return this._plainLead.splice(this._plainLead.length,callNotation.length,...callNotation)
  // }

  private _applyPalendromicSymmetry(arr: placeNotationArray) {
    return arr.concat(arr.slice(0,-1).reverse());
  }

  /*
  * Convert place notation string into an array of place making bells for a leadend
  * Input: placeNotationString
  * Output: placeNotationArray
  */
  private _encodePlaceNotation(placeNotationString: string) {
    const array: placeNotationArray = [];
    let placeBells: Array<number> = [];
    for (let char of placeNotationString) {
      if ('.x'.includes(char)) {
        // all numbers have been collected push them to array
        if (placeBells.length > 0) array.push(placeBells);
        if (char === 'x') array.push([]);
        placeBells = [];
      } else {
        // gather placebells
        if (char === '0') placeBells.push(10);
        else if (char === 'E') placeBells.push(11);
        else if (char === 'T') placeBells.push(12);
        else placeBells.push(parseInt(char));
      }
    } 
    array.push(placeBells);
    return array
  }

  private _getPlaceNotationArray(placeNotationString: string): placeNotationArray {
    const parts = placeNotationString.split(',');
    let outArr: placeNotationArray = [];

    parts.forEach(part => {
      let arr = this._encodePlaceNotation(part);
      if (part.length > 5) {
        arr = this._applyPalendromicSymmetry(arr);
      }
      outArr = outArr.concat(arr);
    })

    return outArr;
  }
    
  private _getNumberOfBells(stage: string): number {
    if (stage === 'Maximus') return 12;
    if (stage === 'Royal') return 10;
    if (stage === 'Caters') return 9;
    if (stage === 'Major') return 8;
    if (stage === 'Triples') return 7;
    if (stage === 'Minor') return 6;
    if (stage === 'Doubles') return 5;
    if (stage === 'Minimus') return 4;
    throw Error('Stage not found');
  }



}
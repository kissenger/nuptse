
import { MethodDescriptor, placeNotationArray } from "../types";

export class Method {
  private _name: string;
  private _stage: string;
  private _callPosition: number;
  private _plainCourse: placeNotationArray;
  private _calls: {[key: string]: placeNotationArray} = {}; 
  private _isEven: boolean;
  private _placeNotation: string;

  constructor(method: MethodDescriptor) {
    this._name = method.name;
    this._stage = method.stage;
    this._placeNotation = method.notation;
    this._isEven = this._numberOfBells % 2 === 0;
    this._plainCourse = this._getPlainCourse;
    this._calls = this._getCalls;    
    this._callPosition = this.leadLength - Math.max(...Object.values(this._calls).map(c => c.length));
  }

  /*
  * Public getters
  */
  public get leadLength() { return this._plainCourse.length; }
  public get numberOfBells() { return this._numberOfBells; }
  public get name() { return this._name; }
  public get stage() { return this._stage; }
  public get callPosition() { return this._callPosition; }

  /* 
  *  Get the transformation for the requested row
  *  If a call is provided AND the call changes are available for that row, return the call 
  */
  public getChanges(row: number, callType?: 'bob' | 'single' | undefined) {
    if (!!callType) {
      if (row >= this.leadLength - this._calls[callType].length) {
        return this._calls[callType][row - this.leadLength + 1];
      }
    }
    return this._plainCourse[row];
  }

  /*
  * Apply symmetry to the provided array
  */
  private _applyPalendromicSymmetry(arr: placeNotationArray) {
    return arr.concat(arr.slice(0,-1).reverse());
  }

  /*
  * Convert place notation string into an array of place making bells for a leadend
  */
  private _unpackPlaceNotation(placeNotationString: string) {
    const array: placeNotationArray = [];
    let placeBells: Array<number> = [];
    
    for (let char of placeNotationString) {
      if ('.x-'.includes(char)) {
        if (placeBells.length > 0) array.push(placeBells);
        if ('x-'.includes(char)) array.push([]);
        placeBells = [];
      } else {
        if (char === '0') placeBells.push(10);
        else if (char === 'E') placeBells.push(11);
        else if (char === 'T') placeBells.push(12);
        else placeBells.push(parseInt(char));
      }
    } 
    array.push(placeBells);
    return array
  }


  /* 
  *  Get changes for each row in a plain course
  */
  private get _getPlainCourse() {
    let outArr: placeNotationArray = [];
    this._placeNotation.split(',').forEach(part => {
      let arr = this._unpackPlaceNotation(part);
      if (part.length > 5) {
        arr = this._applyPalendromicSymmetry(arr);
      }
      outArr = outArr.concat(arr);
    })
    return outArr;
  }

  /*
  * Infer the number of hunt bells:
  *   If the method is odd and 3pb is making a place at the leadend, its likely to have two hunt bells
  */
  private get _isMultipleHuntBells() {
    return !this._isEven && this._placeNotation.slice(-1) === '3';
  }

  /*
  *
  */
  private get _getCalls() {

    let bob: Array<Array<number>> = [];
    let single: Array<Array<number>> = [];

    /*
    *  Find the last change that does not have a single placebell in 1pb
    */
    const index = this._plainCourse.reverse().findIndex( r => r.length > 1 || r[0] !== 1 );
    const affectedChanges = this._plainCourse.slice(index);
    const n = this._numberOfBells;

    /*
    *  The rules for a BOB:
    *  For an even method - move pb 2 right is pb = 2, 2 left if pb is behind
    *  For an odd method - pb of interest is not a 1,2,3 or last bell, move anything else to a 3.
    *  The rules for a SINGLE:
    *  For an even method - move pb 2 right is pb = 2, 2 left if pb is behind
    *  For an odd method - pb of interest is not a 1,2,3 or last bell, move anything else to a 3.
    */ 

    if (this._isEven) {
      if (affectedChanges[0].includes(2)) {
        bob = [[1, 4]];
        single = [[1, 2, 3, 4]]
      } else if (affectedChanges[0].includes(n)) {
        bob = [[1, n-2]];
        single = [[1, n-2, n-1, n]];
      }
    } else {
      if (affectedChanges.length === 2) {
        if (affectedChanges[0].every(e=>![1,2,3,n].includes(e))) {
          bob = [[3],[]];
          single = [[3],[1, 2, 3]];
        }
      } else if (affectedChanges.length == 1) {
        const a = affectedChanges[0]
        bob = [[1,a[1]+2,a[2]]];
        single = [[1,a[1],a[1]+1,a[1]+2,a[2]]];
      }

    }


    return {bob, single};

  }
    
  private get _numberOfBells(): number {
    switch (this._stage) {
      case 'Maximus': return 12;
      case 'Cinques': return 11;
      case 'Royal':   return 10;
      case 'Caters':  return 9;
      case 'Major':   return 8;
      case 'Triples': return 7;
      case 'Minor':   return 6;
      case 'Doubles': return 5;
      default: return 0;
    }
  }



}
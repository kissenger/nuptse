
import { MethodDescriptor, PlacebellArray, PlacebellObject, Row } from "../types";
import { Utility } from '@shared/classes/utilities.class';


export class Method {
  private _method: MethodDescriptor;
  private _numberOfBells: number;
  private _placebellObject: PlacebellObject;
  private _leadsPerCourse: number;
  private _leadHead: Row;
  private _huntBells: Array<string>;

  constructor(method: MethodDescriptor) {
    this._method = method;
    this._numberOfBells = Utility.nBells(method.name);
    this._placebellObject = this._getPlaceBellObject();
    this._leadHead = this._getLeadHead();
    this._huntBells = this._getHuntBells(this._leadHead);
    this._leadsPerCourse = this._numberOfBells -  this._huntBells.length;
  }

  /*
  * Public getters and functions
  */
  public get leadLength()      { return this._placebellObject?.plain.length; }
  public get numberOfBells()   { return this._numberOfBells; }
  public get name()            { return this._method.name; }
  public get callPosition()    { return this._placebellObject.callPosition; }
  public get huntBells()       { return this._huntBells; }
  public get leadsPerCourse()  { return this._leadsPerCourse; }
  
  public placebells(rowNumber:number, call:'plain'|'bob'|'single') { 
    return this._placebellObject[call][rowNumber]; 
  }

  public transformRow(startRow: Array<string>, placeBells: Array<number>) {
    const outArr: Array<string> = [];
    let modifier = 0;
    startRow.forEach( (_, i) => {
      if (placeBells.includes(i+1)) modifier = 0;
      else modifier = modifier <= 0 ? 1 : -1;
      outArr.push(startRow[i+modifier])
    })
    return outArr;
  }

  public getPlaceBells(rowNumber: number, call?:'bob'|'single') {
    const callType = !call ? 'plain' : call;
    return this._placebellObject[callType][rowNumber];
  }

  /* A hunt bell is one that remains in the same place at the end of the lead,
   * so here we compare the leadhead to rounds to return the bells where this crtieria is met. */
  private _getHuntBells(leadHead: Row): Array<string> {
    return leadHead.filter( (cv,i) => parseInt(cv) == i + 1);
  }

  // Leadhead in this context is the row that results from the application of 
  // place notation for one full lead, from rounds.
  private _getLeadHead(): Row {
    let curRow: Row = Utility.getRoundsArray(this._numberOfBells);
    for (let i = 0; i < this.leadLength; i++) {
      let pb = this.getPlaceBells(i);
      curRow = this.transformRow(curRow,pb)
    }
    return curRow
  }

  // This maybe doesnt work
  // ================================
  // private _getCoursingOrder(startRow: Row, leadHead: Row): Array<string> {
  //     const coursingOrder = []; 
  //     let idx: number = 2;
  //     for (let i = 1; i < startRow.length; i++) {
  //       const n = this._leadHead[idx-1];
  //       console.log(startRow,leadHead,idx,n)
  //       coursingOrder.push(n);
  //       console.log(Utility.charToNumb(n))
  //       console.log(startRow[Utility.charToNumb(n)])
  //       idx = Utility.charToNumb(startRow[Utility.charToNumb(n)-1]);
  //     }
  //     return coursingOrder
  // }


  /*
  * Apply symmetry to the provided array
  */
  private _applyPalendromicSymmetry(arr: PlacebellArray) {
    return arr.concat(arr.slice(0,-1).reverse());
  }

  /*
  * Convert place notation string into an array of place making bells for a leadend
  */

  private _unpackPlaceNotation(pn: string): PlacebellArray {
    const array: PlacebellArray = [];
    let placeBells: Array<number> = [];

    for (let char of pn) {
      if ('.x-'.includes(char)) {
        if (placeBells.length > 0) array.push(placeBells);
        if ('x-'.includes(char)) array.push([]);
        placeBells = [];
      } else {
        // notation must be numerical as relies on array element numbers
        placeBells.push(Utility.charToNumb(char));
      }
    } 
    array.push(placeBells);

    if (array.length > 5) {
      return this._applyPalendromicSymmetry(array);
    }
    return array
  }

  /*
  *  Return full course place notation for bob and single courses
  */
  private _getPlaceBellObject() {

    let plain: PlacebellArray = this._method.notation.split(',').flatMap(pn => this._unpackPlaceNotation(pn));
    const n = this._numberOfBells;

    /*
    *  Find the last change that does not have a single placebell in 1pb
    */
    const callPosition = plain.findLastIndex( r => r.length > 1 || r[0] !== 1 );
    const affectedChanges = plain.slice(callPosition);

    let bob: PlacebellArray = [...plain];
    let single: PlacebellArray = [...plain];
    /*
    *  The rules for a BOB:
    *  For an even method - move pb 2 right is pb = 2, 2 left if pb is behind
    *  For an odd method - pb of interest is not a 1,2,3 move anything else to a 3.
    *  The rules for a SINGLE:
    *  For an even method - move pb 2 right is pb = 2, 2 left if pb is behind
    *  For an odd method - pb of interest is not a 1,2,3 or last bell, move anything else to a 3.
    */ 

    if (this._numberOfBells % 2 === 0) { //even
      if (callPosition !== plain.length - 1) throw new Error('Something went wrong getting bobs and singles for even method')
      if (plain[callPosition].includes(2)) {
        bob.splice(callPosition, 1, [1,4]);
        single.splice(callPosition, 1, [1,2,3,4]);
      } else {
        bob.splice(callPosition,1,[1, n-2]);
        single.splice(callPosition,1,[1, n-2, n-1, n]);
      }

    } else { //odd
      if (callPosition === plain.length - 2) {
        if (plain.slice(callPosition)[0].every(e=>![1,2,3].includes(e))) {
          bob.splice(callPosition,2,...[[3],[1]]);
          single.splice(callPosition,2,...[[3],[1, 2, 3]]);
        }
      } if (callPosition === plain.length - 1) {
        const a = affectedChanges[0]
        bob.splice(callPosition, 1, [1,plain[callPosition][1]+2,plain[callPosition][2]]);
        single.splice(callPosition, 1, [1,a[1],a[1]+1,a[1]+2,a[2]]);
      }
    }

    return {plain, bob, single, callPosition};

  }
}
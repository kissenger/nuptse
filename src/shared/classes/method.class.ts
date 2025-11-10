
import { NumberLiteralType } from "typescript";
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
  public get leadLength()        { return this._placebellObject?.plain.length; }
  public get numberOfBells()     { return this._numberOfBells; }
  public get name()              { return this._method.name; }
  public get callingPositions()  { 
    return this._placebellObject.calls.map(c => {
      let cr = c.callRow - 3;
      return cr < 0 ? this.leadLength + cr - 1 : cr;
    }); 
  }
  public get huntBells()         { return this._huntBells; }
  public get leadsPerCourse()    { return this._leadsPerCourse; }
  

  /*
  * Returns an array containing the bell positions that are making a place for the next change
  */
  private _getPlaceBells(rowNumber:number, call:null|'bob'|'single'): Array<number> { 
    if (call) {
      for (let i = 0; i < this._placebellObject.calls.length; i++) {
        const calls = this._placebellObject.calls[i];
        if (rowNumber >= calls.callRow && rowNumber < calls.callRow + 3) {
          if (calls[call].length >= rowNumber - calls.callRow + 1) {
            return calls[call][rowNumber - calls.callRow];
          } 
        }      
      }
    }
    return this._placebellObject.plain[rowNumber];
  }

  /*
  * Given a starting row and row number, find the appropriate placebells and transform to give a new row
  */
  public transformRow(startRow: Array<string>, rowNumber: number, call?:null|'bob'|'single') {
    const outArr: Array<string> = [];
    const placeBells = this._getPlaceBells(rowNumber, call ?? null);
    let modifier = 0;
    startRow.forEach( (_, i) => {
      if (placeBells.includes(i+1)) modifier = 0;
      else modifier = modifier <= 0 ? 1 : -1;
      outArr.push(startRow[i+modifier])
    })
    return outArr;
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
      curRow = this.transformRow(curRow, i)
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
  *  Return full course place notation for plain course and a calls object
  *  Calls object is an array containing
  *    callEffect - change number at which call takes effect
  *    bob - change notation for a bob at this change
  *    single - change nottation for a single at this change
  */
  private _getPlaceBellObject() {

    let plain: PlacebellArray = this._method.notation.split(',').flatMap(pn => this._unpackPlaceNotation(pn));
    const n = this._numberOfBells;
    let callRow: Array<number>;  // row at which the call takes affect

    if (this._method.callRow) {

      callRow = [2,8]; 

    } else {

      /*
      *  Find the first change, working from the back, that:
      *   - has more than one bell making a place, (even methods always(?) have more that just the treble making  aplace at the LE) OR
      *   - the does not have a place being made in 1pb (for odd methods)
      */

      callRow = [plain.findLastIndex( r => r.length > 1 || r[0] !== 1 )]

    }

    const calls = callRow.map( c => {


      let b: PlacebellArray = [];
      let s: PlacebellArray = [];

      if (this._method.bob && this._method.single) {
        b = this._unpackPlaceNotation(this._method.bob);
        s = this._unpackPlaceNotation(this._method.single);

      } else {
        let a = plain[c];
        if ( this.compareArrays(a, [1, 2]) ) {
          b = [[1, 4]];                     //    move the bell making 2nds two to the right
          s = [[1, 2, 3, 4]];               //    first four bells make a place

        } else if (this.compareArrays(a, [1, n])) {
          b = [[1, n-2]];                   //    move the bell make place not in 2nds two to the left
          s = [[1, n-2, n-1, n]];           //    treble and last three bells make a place
        
        } else if (this.compareArrays(a, [1, 2, n])) { 
          b = [[1, 4, n]];                  // replace 2nds for 4ths
          s = [[1, 2, 3, 4, n]];            // all front bells make a place

        } else if (this.compareArrays(a, [n])) {
          b = [[3]];                        //    make 3rds
          s = [[3],[1,2,3]];                //    make long 3rds
        }
      }

      return {callRow: c, bob: b, single: s}

    })


    return {plain, calls};

  }

  private compareArrays(arr1: Array<any>, arr2: Array<any>) {
    return arr1.every((v, i) => v === arr2[i])
  }

}
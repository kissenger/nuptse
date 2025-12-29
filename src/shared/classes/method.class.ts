
import { Bell, MethodCall, MethodDescriptor, PlacebellArray, PlaceNotation, Rows, Sequence, TouchCall } from "../types";
import { Utility } from '@shared/classes/utilities.class';

export class Method {
  private _method: MethodDescriptor;
  private _numberOfBells: number;
  private _leadsPerCourse: number;
  private _firstLead: Rows;
  private _leadHead: Sequence;
  private _huntBells: Array<Bell>;
  private _touchEffectRows: Array<number>;
  private _plain: PlacebellArray;
  private _calls: {bob: PlacebellArray, single: PlacebellArray};
  private _shortName: string;
  private _isPrinciple: boolean;
  private _noBobsFlag: boolean;

  constructor(method: MethodDescriptor) {
    this._method = method;
    this._shortName = method.shortName ?? this.name.split(' ')[0];
    this._numberOfBells = Utility.nBells(method.name);
    this._plain = this._method.notation.split(',').flatMap(pn => this._unpackPlaceNotation(pn));
    this._touchEffectRows = this._method.touchEffectRows ?? [this._plain.findLastIndex( r => r.length > 1 || r[0] !== 1 )]
    this._calls = this._getCalls();
    this._firstLead = this.getLead(this._plain);
    this._leadHead = this._firstLead[this._firstLead.length - 1].sequence;
    this._huntBells = this._getHuntBells(this._leadHead);
    this._leadsPerCourse = this._numberOfBells -  this._huntBells.length;
    this._isPrinciple = this._huntBells.length === 0;
    this._noBobsFlag = method.flags?.includes('noBobs') ?? false;
  }


  /*
  * Public getters and functions
  */
  public get shortName()         { return this._shortName; } 
  public get firstLead()         { return this._firstLead; }
  public get leadLength()        { return this._firstLead.length - 1; }
  public get numberOfBells()     { return this._numberOfBells; }
  public get name()              { return this._method.name; }
  public get huntBells()         { return this._huntBells; }
  public get isPrinciple()       { return this._isPrinciple; }
  public get leadsPerCourse()    { return this._leadsPerCourse; }
  public get touchEffectRows()   { return this._touchEffectRows; }
  public get noBobsFlag()        { return this._noBobsFlag; }

  /*
   * Returns a placebell array for the lead end, with the requested calls implemented at the calling positions
   */
  public getPlaceBells(touchCalls: Map<number, TouchCall | MethodCall>): PlacebellArray {
    
    const pb = [...this._plain];
    touchCalls.forEach( (call, row) => {
      if (call === 'bob' || call === 'single') {
        pb.splice(row, this._calls[call].length, ...this._calls[call]);
      }
    });
    
    return pb;
  }

  /*
  * Given a starting row and place notation, transform to give a new row
  */
  public transformRow(startRow: Sequence, placeBells: Array<number>): Sequence {
    const sequence: Sequence = [];
    let modifier = 0;
    startRow.forEach( (_, i) => {
      if (placeBells.includes(i+1)) modifier = 0;
      else modifier = modifier <= 0 ? 1 : -1;
      sequence.push(startRow[i+modifier])
    })
    return sequence;
  }

  /* A hunt bell is one that remains in the same place at the end of the lead,
   * so here we compare the leadhead to rounds to return the bells where this crtieria is met. */
  private _getHuntBells(leadHead: Sequence): Array<Bell> {
    return leadHead.filter( (cv,i) => parseInt(cv) == i + 1);
  }

  /*
   * Returns an array of changes given a placebell array and a starting row (leadhead)
   */
  public getLead(placebellArray: PlacebellArray, leadHead?: Sequence): Rows {

    let rows: Rows = [{sequence: leadHead ?? Utility.getRoundsArray(this._numberOfBells)}];
    placebellArray.forEach( pb => {
      const startRow: Sequence = rows[rows.length-1].sequence;
      rows.push({sequence: this.transformRow(startRow, pb)});
    })

    return rows;
  }

  /*
  * Apply symmetry to the provided array
  */
  private _applyPalendromicSymmetry(arr: PlacebellArray) {
    return arr.concat(arr.slice(0,-1).reverse());
  }

  /*
  * Convert place notation string into an array of place making bells for a leadend
  */

  private _unpackPlaceNotation(pn: PlaceNotation): PlacebellArray {
    const array: PlacebellArray = [];
    let placeBells: Array<number> = [];

    for (let char of pn) {
      if ('.x-'.includes(char)) {
        if (placeBells.length > 0) array.push(placeBells);
        if ('x-'.includes(char)) array.push([]);
        placeBells = [];
      } else {
        // notation must be numerical as relies on array element numbers
        placeBells.push(Utility.charToNumb(<Bell>char));
      }
    } 
    array.push(placeBells);

    if (array.length > 4) {
      return this._applyPalendromicSymmetry(array);
    }
    return array
  }

  /*
  *  Return full course place notation for plain course and a calls object
  *  Calls object is an objec
  *    bob - change notation for a bob at this change
  *    single - change nottation for a single at this change
  */
  private _getCalls(): {bob: PlacebellArray, single: PlacebellArray} {

    let bob:    PlacebellArray = [];
    let single: PlacebellArray = [];

    if (this._method.bob && this._method.single) {
      // ASSUMPTION: If one call type is defined in lib, then the other is too
      bob =    this._unpackPlaceNotation(<PlaceNotation>this._method.bob);
      single = this._unpackPlaceNotation(this._method.single);

    } else {
      // ASSUMPTION: If there is more than one calling row per LE, then notation for plain 
      // course is the same at both positions
      let a = this._plain[this._touchEffectRows[0]];
      const n = this._numberOfBells;

      if ( this.compareArrays(a, [1, 2]) ) {
        bob =    [[1, 4]];                     //    move the bell making 2nds two to the right
        single = [[1, 2, 3, 4]];               //    first four bells make a place

      } else if (this.compareArrays(a, [1, n])) {
        bob =    [[1, n-2]];                   //    move the bell make place not in 2nds two to the left
        single = [[1, n-2, n-1, n]];           //    treble and last three bells make a place
      
      } else if (this.compareArrays(a, [1, 2, n])) { 
        bob =    [[1, 4, n]];                  // replace 2nds for 4ths
        single = [[1, 2, 3, 4, n]];            // all front bells make a place

      } else if (this.compareArrays(a, [n])) {
        bob =    [[3]];                        //    make 3rds
        single = [[3],[1,2,3]];                //    make long 3rds
      }
    }

    return {bob, single};

  }

  private compareArrays(arr1: Array<any>, arr2: Array<any>) {
    return arr1.every((v, i) => v === arr2[i])
  }

}
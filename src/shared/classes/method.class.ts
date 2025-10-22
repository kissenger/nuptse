
import { MethodDescriptor, placebellArray, placebellObject } from "../types";
import { Utility } from '@shared/classes/utilities.class';

export class Method {
  private _name: string;
  private _numberOfBells: number;
  private _plainCourse: placebellArray;
  private _placebellObject: placebellObject;
  private _calls: {[key: string]: placebellArray} = {}; 
  private _isEven: boolean;
  // private _placeNotation: string;

  constructor(method: MethodDescriptor) {
    this._name = method.name;
    // this._placeNotation = method.notation;
    this._numberOfBells = Utility.nBells(method.name);
    this._isEven = this._numberOfBells % 2 === 0;
    this._plainCourse = this._getPlainCourse(method.notation);
    this._calls = this._getCalls(this._plainCourse);
    this._placebellObject = {
      plain: this._plainCourse,
      bob:   this._getBobOrSingleCourse(this._plainCourse,this._calls,'bob'),
      single: this._getBobOrSingleCourse(this._plainCourse,this._calls,'single')
    }
    console.log(this._placebellObject)
  }

  /*
  * Public getters and functions
  */
  public get leadLength()    { return this._plainCourse.length; }
  public get numberOfBells() { return this._numberOfBells; }
  public get name()          { return this._name; }
  public get callPosition()  { return this.leadLength - Math.max(...Object.values(this._calls).map(c => c.length)) - 1; }
  public placebells(rowNumber:number, call:'plain'|'bob'|'single') { 
    return this._placebellObject[call][rowNumber];
  }

  /*
  * Apply symmetry to the provided array
  */
  private _applyPalendromicSymmetry(arr: placebellArray) {
    return arr.concat(arr.slice(0,-1).reverse());
  }

  /*
  * Convert place notation string into an array of place making bells for a leadend
  */
  private _unpackPlaceNotation(placeNotationString: string) {
    const array: placebellArray = [];
    let placeBells: Array<number> = [];
    
    for (let char of placeNotationString) {
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
    return array
  }


  /* 
  *  Get changes for each row in a plain course
  */
  private _getPlainCourse(placeNotation: string) {
    let outArr: placebellArray = []; 
    placeNotation.split(',').forEach(part => {
      let arr = this._unpackPlaceNotation(part);
      if (part.length > 5) {
        arr = this._applyPalendromicSymmetry(arr);
      }
      outArr = [...outArr, ...arr];
    })
    return outArr;
  }

  /* 
  *  Replace the last rows in a plain course with the appropriate calls
  */
  private _getBobOrSingleCourse(plainCourse:placebellArray,calls:{[key: string]: placebellArray},call:'bob'|'single') {
    let outArr = [...plainCourse];
    let start = plainCourse.length - calls[call].length;
    let deleteCount = calls['bob'].length;
    outArr.splice(start, deleteCount, ...calls[call]);
    return outArr;
  }


  /*
  *
  */
  private _getCalls(plainCourse: placebellArray) {

    let bob: placebellArray = [];
    let single: placebellArray = [];
    let pc: placebellArray = [...plainCourse];
    // console.log(pc)
    console.log(plainCourse)

    /*
    *  Find the last change that does not have a single placebell in 1pb
    */
    const index = pc.findLastIndex( r => r.length > 1 || r[0] !== 1 );
    const affectedChanges = pc.slice(index);
    const n = this._numberOfBells;

    console.log(index,affectedChanges,n);

    /*
    *  The rules for a BOB:
    *  For an even method - move pb 2 right is pb = 2, 2 left if pb is behind
    *  For an odd method - pb of interest is not a 1,2,3 move anything else to a 3.
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
    } else { //odd
      if (affectedChanges.length === 2) {
        if (affectedChanges[0].every(e=>![1,2,3].includes(e))) {
          bob = [[3],[1]];
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
    
}
import { MethodDescriptor } from "@shared/types";
import { Utility } from "./utilities.class";
import { METHODS_DB } from "@shared/methods.lib";


/*
  Class to manage lists of methods
  List is instantiated as empty, with methods to add, remove, clear etc
*/
export class MethodList {

  private _allMethods: Array<MethodDescriptor>;
  private _list: Array<MethodDescriptor> = [];

  constructor() {
    this._allMethods = METHODS_DB;
  }

  public get list() {
    return this._list;
  }

  public add(name: string) {
    const methodDescriptor: MethodDescriptor | undefined = this._allMethods.find( m => m.name === name);
    if (methodDescriptor) {
      this._list.push(methodDescriptor);
    } else {
      throw Error;
    }
  }

  public remove(methodName: string) {
    this._list = this._list.filter(({name}) => name !== methodName)
  }

  public clear() {
    this._list = [];
  }

  public get isEmpty() {
    return this._list.length === 0;
  }

  public unfilter() {
    this._list = this._allMethods;
  }

  public addAll() {
    this._list = this._allMethods;
  }

  public filterByStage(stage: string) {
    this._list = this._list.filter( (m: MethodDescriptor) => m.name.toLowerCase().indexOf(stage ?? '')>=0);
  }

  public filterBySearchString(searchString: string) {
    this._list = this._list.filter( (m: MethodDescriptor) => m.name.toLowerCase().indexOf(searchString.toLowerCase()) >= 0);
  }

  public filterOutSelectedMethods(selectedMethods: MethodList) {
    this._list = this._list.filter( (m: MethodDescriptor) => !selectedMethods.list.find( ({name}) => name === m.name));
  }

  public get stage() {
    if (this.isEmpty) return false;
    return Utility.stageFromMethodName(this._list[0].name);
  }

  public get nBells() {
    if (this.isEmpty) return false;
    return Utility.nBellsFromMethodName(this._list[0].name);
  }

  public get allMethodsHaveNoBobsFlag() {
    return this._list.every( (m) => m.flags?.includes('noBobs'));

  }

}

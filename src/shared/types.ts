import { Method } from "./classes/method.class";

export type RowsToPrintArray = Array<RowToPrint>;
export type RowToPrint = {sequence: Array<string>, isLeadEnd: boolean, call: string | null};
export type Row = Array<string>;

export type PlacebellArray = Array<Array<number>>

export type PlacebellObject = {
  plain:  PlacebellArray,
  bob:    PlacebellArray,
  single: PlacebellArray,
  callPosition: number
}

export interface MethodDescriptor {
  name: string,
  notation: string,
  calls?: {
    [key: string]: string;
  }
}


export class PracticeOptions {
  public bobs: boolean = false; 
  public singles: boolean = false;
  public workingBell: string = 'Random';
};

export type MethodsArray = Array<Method>;
export type MethodDescriptorsArray = Array<MethodDescriptor>;

export interface Options {
  showTreble: boolean,
  showNonWorkingBells: boolean
}

export interface BellPositionHistory {
  bellNumber: [{x: number, y:number}]
}
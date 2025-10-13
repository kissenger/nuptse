import { Method } from "./classes/method.class";

export type RowsToPrintArray = Array<RowToPrint>;
export type RowToPrint = {sequence: Array<number>, isLeadEnd: boolean, call: string};

export type placebellArray = Array<Array<number>>
export type placebellObject = {
  'plain':  placebellArray,
  'bob':    placebellArray,
  'single': placebellArray
}

export interface MethodDescriptor {
  name: string,
  stage: string,
  notation: string,
  calls?: {
    [key: string]: string;
  }
}
export type CallOptions = ['None', 'Some', 'Lots'];
export type CallsObject =  {plain: number, bobs: number, singles: number};
export type MethodsArray = Array<Method>;
export type MethodDescriptorsArray = Array<MethodDescriptor>;

export interface Options {
  showTreble: boolean,
  showNonWorkingBells: boolean
}

export interface BellPositionHistory {
  bellNumber: [{x: number, y:number}]
}
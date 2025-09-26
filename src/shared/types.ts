import { Method } from "./classes/method.class";

export type placeNotationArray = Array<Array<number>>

export interface MethodDescriptor {
  name: string,
  stage: string,
  abbr: string,
  notation: string,
  bob: string,
  single: string,
}
export type ActiveMethods = Array<Method>;

export interface Options {
  showTreble: boolean,
  showNonWorkingBells: boolean
}

export interface BellPositionHistory {
  bellNumber: [{x: number, y:number}]
}
import { Method } from "./classes/method.class";


// Practice Component
export type Coord = {x: number, y: number};
export class PracticeOptions {
  bobs: boolean = false; 
  singles: boolean = false;
  workingBell: string = 'Random';
  showHuntBells: boolean = true;
  showHuntBellsTrebleOnly: boolean = true;
  showLeadend: boolean = true;
};
 
//Methods Class
export type Bell = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | 'E' | 'T';
export type Sequence = Array<Bell>;
export type Row = {
  sequence: Sequence, 
  call?: MethodCall | TouchCall, 
  isLeadend?: boolean,
  isLeadhead?: boolean,
  isLastRow?: boolean};
export type Rows = Array<Row>;
export type Calls = Map<number, MethodCall | TouchCall>;
export type PlacebellArray = Array<Array<number>>
export type MethodsArray = Array<Method>;
export type TouchCall = 'bob' | 'single' | null;
export type MethodCall = string;
export type PlaceNotation = string;
export type MethodDescriptorsArray = Array<MethodDescriptor>;
export interface MethodDescriptor {
  name: string,
  notation: string,
  bob?: string | false,
  single?: string | false,
  touchEffectRows?: Array<number>
  shortName?: string,
  flags?: Array<string>
}
import { Bell } from "@shared/types";
import { METHODS_DB } from "@shared/methods.lib";

export class Utility {

  static getMethodDescriptorFromName(name: string) {
    return METHODS_DB.find( m => m.name === name);
  } 

  static randomInteger(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getRoundsArray(numberOfBells: number): Array<Bell> {
    return Array.from({length: numberOfBells}, (v,i) => this.numbToChar(i+1));
  }

  static charToNumb(char: Bell): number {
    if (char === '0') return 10;
    if (char === 'E') return 11;
    if (char === 'T') return 12;
    return parseInt(char);
  }

  static numbToChar(numb: number): Bell {
    if (numb === 10) return '0';
    if (numb === 11) return 'E';
    if (numb === 12) return 'T';
    return <Bell>numb.toString();
  }

  static stageFromMethodName = (name: string) => {
    return name.split(' ').at(-1)?.toLowerCase();
  }

  static nBellsFromMethodName = (name: string): number => {
    const stage = this.stageFromMethodName(name);
    switch (stage?.toLowerCase()) {  
      case 'maximus': return 12;
      case 'cinques': return 11;
      case 'royal':   return 10;
      case 'caters':  return 9;
      case 'major':   return 8;
      case 'triples': return 7;
      case 'minor':   return 6;
      case 'doubles': return 5;
      default: return 0;
    }
  }

}

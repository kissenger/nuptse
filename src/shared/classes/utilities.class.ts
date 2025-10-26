

export class Utility {


  static randomInteger(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getRoundsArray(numberOfBells: number): Array<string> {
    return Array.from({length: numberOfBells}, (v,i) => this.numbToChar(i+1));
  }

  static charToNumb(char: string) {
    if (char === '0') return 10;
    if (char === 'E') return 11;
    if (char === 'T') return 12;
    return parseInt(char);
  }

  static numbToChar(numb: number) {
    if (numb === 10) return '0';
    if (numb === 11) return 'E';
    if (numb === 12) return 'T';
    return numb.toString();
  }

  static stageFromMethodName = (name: string) => {
    return name.split(' ').at(-1)?.toLowerCase();
  }

  static nBells = (name: string): number => {
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

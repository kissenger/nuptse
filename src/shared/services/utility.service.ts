
export class Utility {

  stageFromMethodName(name: string) {
    return name.split(' ').at(-1)?.toLowerCase() ?? ''
  }

  nBells(stage:string): number {
    switch (stage.toLowerCase()) {
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
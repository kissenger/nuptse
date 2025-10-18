import { Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
import { BellPositionHistory, CallsObject, MethodDescriptorsArray,RowsToPrintArray, RowToPrint } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Practice } from '@shared/classes/practice.class';

@Component({
  selector: 'app-practice',
  imports: [FormsModule, CommonModule, DecimalPipe],
  templateUrl: './practice.component.html',
  styleUrl: './practice.component.css',
  standalone: true
})

export class PracticeComponent {

  @Input() methods: MethodDescriptorsArray = [];
  @Input() calls: CallsObject = {plain: 100, bobs: 0, singles: 0};
  @ViewChild('svg') _svgElement!: ElementRef<SVGElement>;
  @Input() workingBell: number = 0;
  // @ViewChild('canvas') _canvasElement!: ElementRef<HTMLCanvasElement>;
  // @ViewChild('canvasContainer') _canvasContainer!: ElementRef<HTMLDivElement>;
  @HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    if (["ArrowDown","ArrowLeft","ArrowRight"].includes(event.key)) {
      event.preventDefault();
      this.processKeyEvent(event.key);
    }
  }

  private _N_ROWS_TO_PRINT: number = 10;
  private _FONT_SIZE: string = '50px Courier New';

  private _CHAR_WIDTH = 30;
  private _LINE_HEIGHT = 30;
  private _LINE_HEIGHT_ADJUST = -10;
  private _CHAR_WIDTH_ADJUST = 10;
  
  private _LEposition: number = 0;
  private _svgNamespace = "http://www.w3.org/2000/svg";
  private _rows: Array<SVGElement> = [];
  private _numberXs: {[key: number]: Array<number>} = [];
  private _paths: {[key: number]: SVGElement} = {}
  private _currentRow?: RowToPrint;

  public practice!: Practice;
  public errorCount: number = 0;
  public keyPresses: number = 0;


  constructor(
  ) {}

  ngOnInit() {
    
    // this._rowsToPrint.push(this.practice.step());
  }

  ngAfterViewInit() {
    console.log(this._svgElement)
    this.practice = new Practice(this.methods, this.calls, this.workingBell);
    this.createPaths();
    this._currentRow = this.practice.step()
    this.printRow();
  }


  printRow() {
    
    let x = 0;
    const y = (this._rows.length + 1) * this._LINE_HEIGHT;

    const rowText = document.createElementNS(this._svgNamespace, 'text');
    rowText.setAttribute('y', y.toString());
    rowText.setAttribute('font-size', '30px');
    rowText.setAttribute('font-family', 'Courier New')
    rowText.setAttribute('font-weight', 'lighter')

    for (let i = 0; i < this._currentRow!.sequence.length; i++) {

      const bell = this._currentRow!.sequence[i];
      if (bell === 1 || bell === this.workingBell) {
        if (!this._numberXs[bell]) this._numberXs[bell] = [x + this._CHAR_WIDTH_ADJUST];
        else this._numberXs[bell].push(x + this._CHAR_WIDTH_ADJUST);
      }

      const tspan = <SVGElement>document.createElementNS(this._svgNamespace, 'tspan');
      tspan.setAttribute('x', x.toString());
      tspan.setAttribute('fill', bell === 1 ? 'red' : 'blue');
      tspan.textContent = bell.toString();
      
      rowText.appendChild(tspan)
      x += this._CHAR_WIDTH;

    }

    this._rows.push(<SVGElement>this._svgElement?.nativeElement.appendChild(rowText));

    this.updateRows();
    this.updateBellPaths();
    this.updateLeadendLine();

  }

  createPaths() {
    // path 0 is the LE
    for (const bell of [0, 1, this.workingBell]) {
      const path = <SVGElement>document.createElementNS(this._svgNamespace, 'path');
      path.setAttribute('id', `path-${bell}`);
      path.setAttribute('stroke', bell === 1 ? 'red' : 'blue');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      this._svgElement.nativeElement.appendChild(path);
      this._paths[bell] = path;
    }
  }

  updateLeadendLine() {
    if (this._currentRow?.isLeadEnd) {
      this._LEposition = (this._numberXs[1].length) * this._LINE_HEIGHT + 5;
    } else {
      this._LEposition -= this._LINE_HEIGHT;
    }
    if (this._LEposition < 0) {
      this._paths[0].setAttribute('d', '')
    } else {
      const y = this._LEposition;
      const xmax = this._CHAR_WIDTH * this.practice.numberOfBells;
      this._paths[0].setAttribute('d',`M0,${y},L${xmax},${y}`)
    }
  }

  // manage the number of rows displayed, deleting the uppermost when limit is reached
  updateRows() {
    if (this._rows.length >= this._N_ROWS_TO_PRINT) {
      this._svgElement.nativeElement.removeChild(<SVGElement>this._rows.shift());
      this._numberXs[1].shift();
      this._numberXs[this.workingBell].shift(); 
      for (let i = 0; i < this._rows.length; i++) {
        this._rows[i].setAttribute('y',`${(i + 1) * this._LINE_HEIGHT}`)   
      }
    }   
  }

  // path is recreated from scratch due to rows disappearing  
  updateBellPaths() {
    for (const number of [1, this.workingBell]) {
      if (this._numberXs[number].length < 2) {
        this._paths[number].setAttribute('d', ''); // Clear path if not enough points
      } else {
        const positions = this._numberXs[number];
        const d = positions.map((x, i) => (i === 0 ? 'M' : 'L') + `${x},${(i + 1) * this._LINE_HEIGHT + this._LINE_HEIGHT_ADJUST}`).join(' ');
        this._paths[number].setAttribute('d', d);
      }
    }

  }

  processKeyEvent(receivedKeypress: string) {
    let expectedKeypress = ['ArrowLeft','ArrowDown','ArrowRight'][this.practice.workingBellNextMove+1];
    this.keyPresses++;
    if (receivedKeypress === expectedKeypress) {
      // this._rowsToPrint.push(this.practice.step());
      // if (this._rowsToPrint.length > this._N_ROWS_TO_PRINT) this._rowsToPrint.shift();
      this._currentRow = this.practice.step()
      this.printRow();   
    } else {
      this.errorCount++;
    }
  }

}



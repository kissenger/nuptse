import { Component, ElementRef, HostListener, Input, OnChanges, Renderer2, ViewChild} from '@angular/core';
import { CallsObject, MethodDescriptorsArray, RowToPrint } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { CommonModule, PercentPipe } from '@angular/common';
import { Practice } from '@shared/classes/practice.class';
import { NavService } from '@shared/services/nav.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-practice',
  imports: [FormsModule, CommonModule, PercentPipe],
  templateUrl: './practice.component.html',
  styleUrl: './practice.component.css',
  standalone: true
})

export class PracticeComponent implements OnChanges{

  @ViewChild('svg') _svgElement!: ElementRef<SVGElement>;
  @ViewChild('callbox') _callbox!: ElementRef<HTMLElement>;
  
  @Input() methods: MethodDescriptorsArray = [];
  @Input() calls: CallsObject = {plain: 100, bobs: 0, singles: 0};
  @Input() workingBell: string = '';
  
  @HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    if (["ArrowDown","ArrowLeft","ArrowRight"].includes(event.key)) {
      event.preventDefault();
      this.processKeyEvent(event.key);
    }
  }

  private _N_ROWS_TO_PRINT: number = 10;
  private _CHAR_WIDTH = 30;
  private _LINE_HEIGHT = 30;
  private _LINE_HEIGHT_ADJUST = -10;
  private _CHAR_WIDTH_ADJUST = 10;
  private _LEposition: number = 0;
  private _svgNamespace = "http://www.w3.org/2000/svg";
  private _rows: Array<SVGElement> = [];
  private _numbers: {[key: string]: Array<number>} = {};
  private _paths: {[key: string]: SVGElement} = {}
  private _isFirstKeypress = true;
  private _callHandler: Array<{element: HTMLDivElement, age: number}> = [];
  
  public currentRow?: RowToPrint;
  public practice!: Practice;
  public errorCount: number = 0;
  public successCount: number = 0;

  constructor(
    private _renderer: Renderer2,
    private _sanitiser: DomSanitizer,
    public nav: NavService
  ) { }

  ngOnChanges() {
    this.practice = new Practice(this.methods, this.calls, this.workingBell);
  }

  ngAfterViewInit () {
    this.svgInit();
    this.applyStep();
  }

  svgInit() {
    const w = this.practice.numberOfBells * this._CHAR_WIDTH;
    const h = this._LINE_HEIGHT * this._N_ROWS_TO_PRINT + 10;
    this.resizeSvg(w, h);
    this.createPaths();
  }

  createCall(message: string): HTMLElement {
    const div: HTMLDivElement = this._renderer.createElement('div');
    this._renderer.addClass(div,'callbox-call')
    this._renderer.appendChild(this._callbox.nativeElement, div);
    div.innerHTML = `<q>${message}</q>`;
    this._callHandler.push({element: div, age: 1});
    return div;
  }

  // manages the visibility and removal of call boxes
  // boxes are first hidden, then removed - this allows animation of the removal
  checkCalls() {
    this._callHandler.forEach(call=> {
      if (call.age > 3) {
        const element = this._callHandler.shift(); // relies on oldest elements being first in array
        this._renderer.removeChild(this._callbox.nativeElement, element?.element);
      } else if (call.age === 3) {
        this._renderer.addClass(call.element,'hidden')
        call.age++;
      } else {
        call.age++;
      }
    });
  }

  printRow() {

    let x = 0;
    const y = (this._rows.length + 1) * this._LINE_HEIGHT;
    const rowSvg = document.createElementNS(this._svgNamespace, 'svg');

    for (let i = 0; i < this.currentRow!.sequence.length; i++) {

      const bell = this.currentRow!.sequence[i];

      // record x position of treble and working bell
      if (bell === '1' || bell === this.workingBell) {
        if (!this._numbers[bell]) this._numbers[bell] = [x + this._CHAR_WIDTH_ADJUST];
        else this._numbers[bell].push(x + this._CHAR_WIDTH_ADJUST);
      }

      // print current bell; put a circle around working bell in first row
      rowSvg.appendChild(this.createCharacter(x, y, bell));
      if (bell === this.workingBell && this._rows.length === 0) {
        rowSvg.prepend(this.createCircle(x, y));
      }

      x += this._CHAR_WIDTH;
    }

    this._rows.push(<SVGElement>this._svgElement?.nativeElement.appendChild(rowSvg));

    this.updateRows();
    this.updateBellPaths();
    this.updateLeadendLine();

  }

  createCircle(x: number, y: number) {
    const circle = <SVGElement>document.createElementNS(this._svgNamespace, 'circle');
    circle.setAttribute('cx', (x + this._CHAR_WIDTH_ADJUST).toString());
    circle.setAttribute('cy', (y + this._LINE_HEIGHT_ADJUST).toString());
    circle.setAttribute('r', (this._CHAR_WIDTH/2).toString());
    circle.setAttribute('stroke', 'blue');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('fill', 'none');
    return circle
  }

  createCharacter(x: number, y: number, b: string) {
    const text = <SVGElement>document.createElementNS(this._svgNamespace, 'text');
    text.setAttribute('x', x.toString());
    text.setAttribute('y', y.toString());
    text.setAttribute('font-size', '30px');
    text.setAttribute('font-family', 'Courier New')
    text.setAttribute('font-weight', 'lighter')
    text.setAttribute('fill', b === '1' ? 'red' : 'blue');
    text.textContent = b.toString();
    return text
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

  resizeSvg(w: number, h: number) {
    this._svgElement.nativeElement.setAttribute('width',`${w}`);
    this._svgElement.nativeElement.setAttribute('height',`${h}`);
  }

  updateLeadendLine() {
    if (this.currentRow?.isLeadEnd) {
      this._LEposition = this._numbers['1'].length * this._LINE_HEIGHT + 5;
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
      this._numbers[1].shift();
      this._numbers[this.workingBell].shift(); 
      for (let i = 0; i < this._rows.length; i++) {
        for (let el of this._rows[i].children) {
          el.setAttribute('y',`${(i + 1) * this._LINE_HEIGHT}`) 
        }
      }
    }
  }

  // path is recreated from scratch due to rows disappearing  
  updateBellPaths() {
    for (const number of [1, this.workingBell]) {
      if (this._numbers[number].length < 2) {
        this._paths[number].setAttribute('d', ''); // Clear path if not enough points
      } else {
        const positions = this._numbers[number];
        const d = positions.map((x, i) => (i === 0 ? 'M' : 'L') + `${x},${(i + 1) * this._LINE_HEIGHT + this._LINE_HEIGHT_ADJUST}`).join(' ');
        this._paths[number].setAttribute('d', d);
      }
    }

  }

  applyStep() {
    this.currentRow = this.practice.step()
    if (this.currentRow.call) {
      const call = this.currentRow.call;
      this.createCall(call[0].toUpperCase() + call.slice(1));
    };
    this.checkCalls();
    this.printRow();
  }

  processKeyEvent(receivedKeypress: string) {
    let expectedKeypress = ['ArrowLeft','ArrowDown','ArrowRight'][this.practice.wbMovement+1];
    if (receivedKeypress === expectedKeypress) {
      this.applyStep();
      if (this._isFirstKeypress) {
        this.successCount++;
      };
      this._isFirstKeypress = true;
    } else {
      if (this._isFirstKeypress) {
        this.errorCount++;
        this._isFirstKeypress = false;
      }
    }
  }

}



import { Component, ElementRef, HostListener, Input, OnChanges, Renderer2, ViewChild} from '@angular/core';
import { MethodDescriptorsArray, PracticeOptions, RowToPrint } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { CommonModule, PercentPipe } from '@angular/common';
import { Practice } from '@shared/classes/practice.class';
import { NavService } from '@shared/services/nav.service';

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
  @Input() options = new PracticeOptions;
  
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
  private _rows: Array<HTMLElement> = [];
  private _numbers: {[key: string]: Array<number>} = {};
  private _paths: {[key: string]: SVGElement} = {};
  private _isFirstKeypress = true;
  private _callHandler: Array<{element: HTMLDivElement, age: number}> = [];
  private _workingBell: string = '';
  
  public currentRow?: RowToPrint;
  public practice!: Practice;
  public errorCount: number = 0;
  public successCount: number = 0;

  constructor(
    private _renderer: Renderer2,
    public nav: NavService
  ) { }

  ngOnChanges() {
    this.practice = new Practice(this.methods, this.options);
    this._workingBell = this.practice.workingBell;

  }

  ngAfterViewInit () {
    this.svgInit();
    this.applyStep(true);
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

  createRow(success: boolean) {

    let x = 0;
    const y = (this._rows.length + 1) * this._LINE_HEIGHT;
    const group = document.createElementNS(this._svgNamespace, 'g');
    const svg = document.createElementNS(this._svgNamespace, 'svg');
    const rect = this.createRect(x,y, success ? 'white' : 'red');

    for (let i = 0; i < this.currentRow!.sequence.length; i++) {
      const bell = this.currentRow!.sequence[i];
      const char = this.createCharacter(x, y, bell);
      svg.appendChild(char);
      if (bell === this._workingBell && this._rows.length === 0) {
        svg.prepend(this.createCircle(x, y));
      }
      this.recordNumberPositions(bell, x);
      x += this._CHAR_WIDTH;
    }
    
    group.append(rect)
    group.appendChild(svg);
    
    this._rows.push(<HTMLElement>this._svgElement?.nativeElement.appendChild(group));
  }
  
  recordNumberPositions(b: string, x: number) {
    if (b === '1' || b === this._workingBell) {
      if (!this._numbers[b]) this._numbers[b] = [x + this._CHAR_WIDTH_ADJUST];
      else this._numbers[b].push(x + this._CHAR_WIDTH_ADJUST);
    } 
  }

  createRect(x: number, y: number, colour: string) {
    const rect = document.createElementNS(this._svgNamespace, 'rect');
    rect.setAttribute('width', (this.practice.numberOfBells * this._CHAR_WIDTH).toString());
    rect.setAttribute('height', this._LINE_HEIGHT.toString());
    rect.setAttribute('y', (y-this._LINE_HEIGHT).toString());
    rect.setAttribute('fill',colour);
    rect.setAttribute('opacity','0.2');
    return rect
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
    // text.setAttribute('background', 'red');
    text.textContent = b.toString();
    return text
  }

  createPaths() {
    // path 0 is the LE
    for (const bell of [0, 1, this._workingBell]) {
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
      this._paths![0].setAttribute('d', '')
    } else {
      const y = this._LEposition;
      const xmax = this._CHAR_WIDTH * this.practice.numberOfBells;
      this._paths![0].setAttribute('d',`M0,${y},L${xmax},${y}`)
    }
  }

  // manage the number of rows displayed, deleting the uppermost when limit is reached
  updateRows() {
    if (this._rows.length >= this._N_ROWS_TO_PRINT) {
      this._svgElement.nativeElement.removeChild(<HTMLElement>this._rows.shift());
      this._numbers[1].shift();
      this._numbers[this._workingBell].shift(); 
      for (let i = 0; i < this._rows.length; i++) {
        // update text entries
        for (let el of this._rows[i].children[1].children) {
          el.setAttribute('y',`${(i + 1) * this._LINE_HEIGHT}`) 
        }
        // update background rect
        this._rows[i].children[0].setAttribute('y',`${(i + 1) * this._LINE_HEIGHT - this._LINE_HEIGHT}`);
      }
    }
  }

  // path is recreated from scratch due to rows disappearing  
  updateBellPaths() {
    for (const number of [1, this._workingBell]) {
      if (this._numbers[number].length < 2) {
        this._paths[number].setAttribute('d', ''); // Clear path if not enough points
      } else {
        const positions = this._numbers[number];
        const d = positions.map((x, i) => (i === 0 ? 'M' : 'L') + `${x},${(i + 1) * this._LINE_HEIGHT + this._LINE_HEIGHT_ADJUST}`).join(' ');
        this._paths[number].setAttribute('d', d);
      }
    }

  }

  applyStep(success: boolean) {
    this.currentRow = this.practice.step()
    if (this.currentRow.call) {
      const call = this.currentRow.call;
      this.createCall(call[0].toUpperCase() + call.slice(1));
    };
    this.checkCalls();
    this.createRow(success);
    this.updateRows();
    this.updateBellPaths();
    this.updateLeadendLine();
  }

  processKeyEvent(receivedKeypress: string) {
    let expectedKeypress = ['ArrowLeft','ArrowDown','ArrowRight'][this.practice.wbMovement+1];
    if (receivedKeypress === expectedKeypress) {
      this.applyStep(this._isFirstKeypress);
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



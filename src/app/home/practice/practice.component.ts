import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnChanges, Renderer2, ViewChild} from '@angular/core';
import { Coord, MethodDescriptorsArray, PracticeOptions, Rows } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { CommonModule, PercentPipe, TitleCasePipe } from '@angular/common';
import { Practice } from '@shared/classes/practice.class';
import { NavService } from '@shared/services/nav.service';

@Component({
  selector: 'app-practice',
  imports: [FormsModule, CommonModule, PercentPipe],
  providers: [TitleCasePipe],
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.css', '../home.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PracticeComponent implements OnChanges, AfterViewInit{

  @ViewChild('svg') _svgElement!: ElementRef<SVGElement>;
  @ViewChild('callbox') _callbox!: ElementRef<HTMLElement>;
  @ViewChild('scorebox') _scorebox!: ElementRef<HTMLElement>;
  @Input() methods: MethodDescriptorsArray = [];
  @Input() options = new PracticeOptions;
  @HostListener('document:keydown', ['$event']) 
  onKeydown(event: KeyboardEvent) {
    event.preventDefault();
    this.handleKeyPress(event.key);
  }

  public SVG_HEIGHT = 0;
  public SVG_WIDTH = 0;
  private _ROW_HEIGHT = 35;
  private _COL_WIDTH_NORMAL = 30;
  private _COL_WIDTH_WIDE = 25;
  private _MAX_ROWS = 10;
  
  private _rows: Rows = []; 
  private _pathSegments:  Map<string, Array<string | null>> = new Map(); 
  private _svgNamespace = "http://www.w3.org/2000/svg";
  private _practice!: Practice;
  private _timeSinceLastKeypress = 0;
  private _interval: any;
  private _callHandler: Array<{element: HTMLDivElement, age: number}> = [];
  private _isFirstKeypress = true;

  public rowCount: number = 0;
  public errCount: number = 0;  
  public timeInSeconds = 0;


  constructor(
    private _renderer: Renderer2,
    private _ref: ChangeDetectorRef,
    private _titleCasePipe: TitleCasePipe,
    public nav: NavService
  ) {}

  ngOnChanges() {
    this._practice = new Practice(this.methods, this.options);
  }

  ngAfterViewInit() {
    this.SVG_HEIGHT = (this._MAX_ROWS + 0.25 ) * this._ROW_HEIGHT;
    this.SVG_WIDTH  = this._COL_WIDTH * this._practice.numberOfBells;
    this._practice.roundsArray.forEach(n => { this._pathSegments.set(n, []); });
    this._addRow();
    this._ref.detectChanges();
  }
  
  private get _COL_WIDTH() {
    return this._practice.numberOfBells < 10 ? this._COL_WIDTH_NORMAL : this._COL_WIDTH_WIDE;
  }

  public get score() {
    return Math.max(0,(this.rowCount-this.errCount)/this.rowCount);
  }
  
  public handleKeyPress(receivedKeypress: string) {

    const expectedKeypress = ['ArrowLeft','ArrowDown','ArrowRight'][this._practice.wbMovement + 1];
    if (receivedKeypress === expectedKeypress) {
      this._addRow();
      this.rowCount++;
      this._isFirstKeypress = true;
    } else {
      // only increment error once per row (but flash red each time incorrect btn is pressed)
      this._scorebox.nativeElement.animate(
        [{backgroundColor: 'red'},{backgroundColour: 'inherit'}],
        {duration: 250}
      )
      if (this._isFirstKeypress) this.errCount++;
      this._isFirstKeypress = false;
    }

    this._timeSinceLastKeypress = 0;
    if (!this._interval) this._startTimer();
  }

  private _startTimer() {
    this._interval = setInterval(() => {
      this.timeInSeconds++;
      this._timeSinceLastKeypress++;
      if (this._timeSinceLastKeypress >= 5) {
        if (this._interval) {
          clearInterval(this._interval);
          this._interval = null;
        }
      }
      this._ref.detectChanges();
    }, 1000);
  }

  public _timeInMinsAndSecs(timeInSeconds: number): string {
    const mins = Math.trunc(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`
  }

  private _createCall(message: string) {
    const call: HTMLDivElement = this._renderer.createElement('div');
    this._renderer.addClass(call,'call')
    this._renderer.appendChild(this._callbox.nativeElement, call);
    setTimeout(() => {
      this._renderer.addClass(call,'show')
    }, 10);
    
    call.innerHTML = `<q>${message}</q>`;
    this._callHandler.push({element: call, age: 1});
  }

  // manages the visibility and removal of call boxes
  // boxes are first hidden, then removed - this allows animation of the removal
  private _checkCalls() {
    this._callHandler.forEach( (call, index) => {
      if (call.age > 4) {
        this._renderer.addClass(call.element,'hide')
        this._renderer.removeClass(call.element,'show')
        setTimeout(() => {
          this._renderer.removeChild(this._callbox.nativeElement, call.element);
        },250);
        this._callHandler.splice(index, 1);
      } else {
        call.age++;
      }
    });
  }

  
  /**
   * Redraws the entire visualization (rows and paths).
   */
  private _drawCanvas() {

    // clear canvas
    while (this._svgElement.nativeElement.firstChild) {
      this._renderer.removeChild(this._svgElement.nativeElement, this._svgElement.nativeElement.firstChild);
    }

    // loop through bells and add coloured line
    // dont do this on the first row
    if (this._rows.length > 1) {
      this._practice.roundsArray.forEach( bell => {
        let colour = null;
        if (this._practice.isWorkingBell(bell)) colour = 'blue';
        else if (this.options.showHuntBells) {
          if (!this.options.showHuntBellsTrebleOnly) {
            if (this._practice.isBellInTheHunt(bell)) colour = 'red';
          } else {
            if (bell === '1' && this._practice.isBellInTheHunt('1')) colour = 'red';
          }
        }
        
        const colours = this._pathSegments.get(bell);
        colours!.push(colour);
        if (colours!.length > this._MAX_ROWS - 1) colours?.shift();
      })
    } 

    // create map to store number coordinated in
    const coords: Map<string, Array<Coord>> = new Map(this._practice.roundsArray.map(n => [n, []]));

    // generate numbers, store coordinated and generate LE line
    this._rows.forEach((row, rowIndex) => {

      const y = (rowIndex + 0.75) * this._ROW_HEIGHT;
      row.sequence.forEach((bell, index) => {
        // get and store coordinates of each created character
        const x = (index * this._COL_WIDTH) + (this._COL_WIDTH / 2);
        this._createText(bell, {x, y});
        coords.get(bell)?.push({ x, y: y - (this._ROW_HEIGHT / 2) + 7});
      });

      if (this.options.showLeadend && row.isLeadend) {
        const yy = y + 7 ;
        const p1 = {x: 0, y: yy};
        const p2 = {x: this._practice.numberOfBells * this._COL_WIDTH, y: yy }
        this._createLine(p1, p2, '#1f2937' )
      }
    });

    this._pathSegments.forEach((colours, bell) => {
      const c = coords.get(bell);
      if (c) colours.forEach((colour, i) => {
        this._createLine(c[i], c[i+1], colour)
      });
    });

    // generate circle on first row only
    // currently disappears when second row appears
    if (this._rows.length === 1) {
      const c = coords.get(this._practice.workingBell);
      if (c) this._createCircle(c[0], this._COL_WIDTH / 2);
    }

  }

  private _addRow() {
    
    const currentRow = this._practice.step();
    this._rows.push(currentRow);
    if (this._rows.length > this._MAX_ROWS) this._rows.shift(); 
    if (currentRow.call) this._createCall(this._titleCasePipe.transform(currentRow.call));
    this._checkCalls();
    this._drawCanvas();
  }

  private _createLine(p1: Coord, p2: Coord, colour: string | null) {
    if (!colour) return;
    const line = <SVGElement>this._renderer.createElement('line', this._svgNamespace);
    this._renderer.setAttribute(line, 'x1', p1.x.toString());
    this._renderer.setAttribute(line, 'y1', p1.y.toString());
    this._renderer.setAttribute(line, 'x2', p2.x.toString());
    this._renderer.setAttribute(line, 'y2', p2.y.toString());
    this._renderer.setAttribute(line, 'stroke', colour);
    this._renderer.setAttribute(line, 'stroke-width', '2');
    this._renderer.setAttribute(line, 'stroke-linecap', 'round');
    this._svgElement.nativeElement.appendChild(line);
  }

  private _createText(bell: string, pos: Coord) {
    const text = this._renderer.createElement('text', this._svgNamespace);
    this._renderer.setAttribute(text, 'x', pos.x.toString());
    this._renderer.setAttribute(text, 'y', pos.y.toString());
    this._renderer.setAttribute(text, 'fill', '#1f2937'); 
    this._renderer.setAttribute(text, 'font-size', '30');
    this._renderer.setAttribute(text, 'text-anchor', 'middle');
    this._renderer.setAttribute(text, 'font-family', 'Courier New')
    this._renderer.setAttribute(text, 'font-weight', 'lighter')
    this._renderer.setProperty(text, 'textContent', bell.toString());
    this._svgElement.nativeElement.appendChild(text);
  }

  private _createCircle(pos: Coord, r: number) {
    const circle = <SVGElement>document.createElementNS(this._svgNamespace, 'circle');
    circle.setAttribute('cx', pos.x.toString());
    circle.setAttribute('cy', pos.y.toString());
    circle.setAttribute('r', r.toString());
    circle.setAttribute('stroke', 'blue');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('fill', 'none');
    this._svgElement.nativeElement.appendChild(circle);
  }
}
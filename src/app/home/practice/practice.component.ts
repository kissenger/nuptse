import { Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
import { CallsObject, MethodDescriptorsArray,RowsToPrintArray } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Practice } from '@shared/classes/practice.class';

@Component({
  selector: 'app-practice',
  imports: [FormsModule, CommonModule],
  templateUrl: './practice.component.html',
  styleUrl: './practice.component.css',
  standalone: true
})

export class PracticeComponent {

  @Input() methods: MethodDescriptorsArray = [];
  @Input() calls: CallsObject = {plain: 100, bobs: 0, singles: 0};
  @Input() workingBell: number = 0;
  @ViewChild('canvas') _canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') _canvasContainer!: ElementRef<HTMLDivElement>;
  @HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    if (["ArrowDown","ArrowLeft","ArrowRight"].includes(event.key)) {
      event.preventDefault();
      this.processKeyEvent(event.key);
    }
  }

  private _canvas!: CanvasRenderingContext2D;
  private _rowsToPrint: RowsToPrintArray= [];
  private _nPrintRows: number = 5;
  public practice!: Practice;


  constructor(
  ) {}

  ngOnInit() {
    this.practice = new Practice(this.methods, this.calls, this.workingBell);
    this._rowsToPrint.push(this.practice.step());
  }

  ngAfterViewInit() {

    this._canvas = this._canvasElement.nativeElement.getContext("2d")!;
    this.setCanvasSize();
    this.updateCanvas();
  }

  setCanvasSize() {
    this._canvasElement.nativeElement.width = this._canvasContainer.nativeElement.offsetWidth;
    this._canvasElement.nativeElement.height = this._canvasContainer.nativeElement.offsetWidth*0.9;
  }

  updateCanvas() {
    this._canvas.clearRect(0, 0, this._canvasElement.nativeElement.width, this._canvasElement.nativeElement.height);
    
    let [x0, x, y, dx, dy] = [15, 15, 80, 20, 25];
    let bellHistory: {[key: number]: [{x: number, y: number}]} = {};

    // This block prints numbers to the screen and records position of
    // each bell in each row so we can draw lines through them later
    this._rowsToPrint.forEach( (row,index) => {
      x = x0;
      y += dy;

      // print the leadhead line between treble leads 
      if (row.isLeadEnd) {
        this.drawLine("blue",[{x: x0+x, y: y+5}, {x:x0+x+dx*8, y: y+5}])
      }

      // print number rows
      this._canvas.font = '20px Courier New';
      row.sequence.forEach( bell => {
        x += dx;
        if (bell === 1 || bell === this.workingBell) {
          const {x1, x2, y1, y2} = this.getTextPosition();
          const xy = {x: x-(x2-x1)/2, y: y+(y2-y1)/2};
          if (index === 0) bellHistory[bell] = [xy];
          else bellHistory[bell].push(xy);
        }
        if (bell === 1) this._canvas!.fillStyle = "red";
        else this._canvas!.fillStyle = "blue"; 
        this._canvas!.fillText(bell.toString(),x,y); 
      })


      // print any calls on this line
      this._canvas.font = '20px Courier New';
      if (!['','plain'].includes(row.call)) {
        x += 2*dx;
        this._canvas!.fillStyle = "blue"; 
        this._canvas!.fillText(row.call,x,y); 
      }

    })

    // this block draws lines through desired bells
    this.drawLine("red", bellHistory['1'])
    this.drawLine("blue", bellHistory[this.workingBell])
  }

  getTextPosition() {
    const textMetrics = this._canvas.measureText('8');
    const x1 = textMetrics.actualBoundingBoxAscent;
    const x2 = textMetrics.actualBoundingBoxDescent;
    const y1 = textMetrics.actualBoundingBoxRight;
    const y2 = textMetrics.actualBoundingBoxLeft;
    return {x1, x2, y1, y2}
  }

  drawLine(lineColour: string, coordinates: Array<{x: number, y: number}>) {
    this._canvas.beginPath();
    this._canvas.strokeStyle = lineColour;
    this._canvas.lineWidth = 2;
    coordinates.forEach( (pos, i) => {
      if (i===0) this._canvas.moveTo(pos.x,pos.y);
      else this._canvas.lineTo(pos.x,pos.y);
    })
    this._canvas.stroke();
    this._canvas.closePath();
  }

  processKeyEvent(receivedKeypress: string) {
    let expectedKeypress = ['ArrowLeft','ArrowDown','ArrowRight'][this.practice.workingBellNextMove+1];
    if (receivedKeypress === expectedKeypress) {
      this._rowsToPrint.push(this.practice.step());
      if (this._rowsToPrint.length > this._nPrintRows) this._rowsToPrint.shift();
      this.updateCanvas();    
    } else {
      this.practice.incrementErrorCount();
    }
  }

  left() {
    
  }

  right() {

  }

  down() {

  }
}



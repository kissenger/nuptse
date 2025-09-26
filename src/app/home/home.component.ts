import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Practice } from '../../shared/classes/practice.class';
import { BellPositionHistory } from '../../shared/types';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowLeft": this.onArrowLeft(); break;
      case "ArrowRight": this.onArrowRight(); break;
      case "ArrowDown": this.onArrowDown(); break;
    }
  }

  private canvas?: CanvasRenderingContext2D | null;
  private rows: Array<{sequence: Array<number>, leadHead: boolean}> = [];
  private workingBell = 5;
  private canvasWidth = 300;
  private canvasHeight = 300;
  private practice?: Practice;

  ngAfterViewInit(): void {
    this.canvas = this.canvasElement.nativeElement.getContext("2d");
    this.init();

    this.practice = new Practice('C', 4)
    this.rows.push({sequence: this.practice!.currentRow, leadHead: false})
    this.printRows();
    

  }

  init() {
    this.canvasElement.nativeElement.width = this.canvasWidth;
    this.canvasElement.nativeElement.height = this.canvasHeight;
  }

  printRows() {
    this.canvas!.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.canvas!.font = '20px Courier New';
    let x0 = 15;
    let x = 15;
    let y = 80;
    let dx = 20;
    let dy = 20;
    let bellHistory: {[key: number]: [{x: number, y: number}]} = {};

    // This block prints numbers to the screen and records position of
    // each bell in each row so we can draw lines through them later
    this.rows.forEach( (row,index) => {
      x = x0;
      y += dy;
      if (row.leadHead===true) {
        const {x1, x2, y1, y2} = this.getTextPosition();
        this.drawLine("blue",[{x: x0+x, y: y+5}, {x:x0+x+dx*8, y: y+5}])
      }

      row.sequence.forEach( bell => {
        x += dx;
        if (bell === 1 || bell === this.workingBell) {
          console.log(index,bell,bellHistory)
          const {x1, x2, y1, y2} = this.getTextPosition();
          const xy = {x: x-(x2-x1)/2, y: y+(y2-y1)/2};
          if (index === 0) bellHistory[bell] = [xy];
          else bellHistory[bell].push(xy);
        }
        if (bell === 1) this.canvas!.fillStyle = "red";
        else this.canvas!.fillStyle = "blue"; 
        this.canvas!.fillText(bell.toString(),x,y); 
      })
    })

    // this block draws lines through desired bells
    this.drawLine("red", bellHistory['1'])
    this.drawLine("blue", bellHistory[this.workingBell])
  }

  getTextPosition() {
    const textMetrics = this.canvas!.measureText('8');
    const x1 = textMetrics.actualBoundingBoxAscent;
    const x2 = textMetrics.actualBoundingBoxDescent;
    const y1 = textMetrics.actualBoundingBoxRight;
    const y2 = textMetrics.actualBoundingBoxLeft;
    return {x1, x2, y1, y2}
  }

  drawLine(lineColour: string, coordinates: Array<{x: number, y: number}>) {
    this.canvas!.beginPath();
    this.canvas!.strokeStyle = lineColour;
    this.canvas!.lineWidth = 2;
    coordinates.forEach( (pos, i) => {
      if (i===0) {
        this.canvas!.moveTo(pos.x,pos.y);
      } else {
        this.canvas!.lineTo(pos.x,pos.y);
      }
    })
    this.canvas!.stroke();
    this.canvas!.closePath();
  }

  onArrowLeft() {
    console.log("left");
  }
  onArrowRight() {
    console.log("right");
  }  
  onArrowDown() {
    this.practice!.nextChange();
    this.rows.push({sequence: this.practice!.currentRow, leadHead: this.practice!.isLeadHead});
    if (this.rows.length > 5) {
      this.rows.shift();
    }
    this.printRows();
    console.log("down");
  }  
}



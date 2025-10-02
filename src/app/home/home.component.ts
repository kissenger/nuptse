import { Component, ElementRef, ViewChild, HostListener, ViewChildren, QueryList } from '@angular/core';
import { Practice } from '../../shared/classes/practice.class';
import { BellPositionHistory, MethodDescriptor } from '../../shared/types';
import { METHODS_DB } from "../../shared/methods.lib";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {

  @ViewChildren('anchor') anchors!: QueryList<ElementRef>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (["ArrowDown","ArrowLeft","ArrowRight"].includes(event.key)) {
      event.preventDefault();
      this.processKeyEvent(event.key);
    }
  }

  private canvas?: CanvasRenderingContext2D | null;
  private rows: Array<{sequence: Array<number>, isLeadHead: boolean, isCallPosition: boolean}> = [];
  private workingBell = 5;
  private canvasWidth = 300;
  private canvasHeight = 300;
  private practice?: Practice;
  private errorCount: number = 0;

  public methods = () => !this.selectedMethods[0] ? METHODS_DB : METHODS_DB.filter(m=>m.stage===this.selectedMethods[0]?.stage);
  public filteredMethods: Array<MethodDescriptor> = [];
  public selectedMethods: Array<MethodDescriptor> = [];
  public searchString: string = '';

  ngAfterViewInit(): void {
    this.canvas = this.canvasElement.nativeElement.getContext("2d");
    this.init();

    this.practice = new Practice(['Cambridge Surprise Major'], this.workingBell)
    this.rows.push({sequence: this.practice!.currentRow, isLeadHead: false, isCallPosition: false})
    this.printRows();
    

  }

  scrollTo(anchor: string) {
    const target = document.querySelector('#' + anchor);
    if (!!target) target.scrollIntoView();
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
      if (row.isLeadHead===true) {
        const {x1, x2, y1, y2} = this.getTextPosition();
        this.drawLine("blue",[{x: x0+x, y: y+5}, {x:x0+x+dx*8, y: y+5}])
      }

      row.sequence.forEach( bell => {
        x += dx;
        if (bell === 1 || bell === this.workingBell) {
          const {x1, x2, y1, y2} = this.getTextPosition();
          const xy = {x: x-(x2-x1)/2, y: y+(y2-y1)/2};
          if (index === 0) bellHistory[bell] = [xy];
          else bellHistory[bell].push(xy);
        }
        if (bell === 1) this.canvas!.fillStyle = "red";
        else this.canvas!.fillStyle = "blue"; 
        this.canvas!.fillText(bell.toString(),x,y); 
      })

      if (row.isCallPosition) {
        x += 2*dx;
        this.canvas!.fillText('CALL!',x,y); 
      }
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

  processKeyEvent(key: string) {

    if (this.practice?.correctKeyPress() === key) {
      this.practice!.nextChange();
      this.rows.push({sequence: this.practice!.currentRow, isLeadHead: this.practice!.isLeadHead, isCallPosition: this.practice!.isCallRow});
      if (this.rows.length > 5) {
        this.rows.shift();
      }
      this.printRows();
    } else {
      this.errorCount++;
    }

    console.log('errors: ' + this.errorCount);
  }

  onStageSelect(e:any) {

  }

  onSearch() {
    console.log(this.methods());
    console.log(this.filteredMethods);
    // if (this.searchString === '') {
    //   this.filteredMethods = [];
    // } else {
      this.filteredMethods = this.methods().filter(m=>m.name.toLowerCase().indexOf(this.searchString.toLowerCase())>=0);
      this.filteredMethods = this.filteredMethods.filter(m=>!this.selectedMethods.find( ({name})=>name===m.name));
    // }
    
  }

  addMethod(m:MethodDescriptor) {
    this.filteredMethods = [];
    this.selectedMethods.push(m);
    this.searchString = '';
  }

  removeMethod(md:MethodDescriptor) {
    let i = this.selectedMethods.findIndex( ({name}) => name === md.name);
    this.selectedMethods.splice(i,1);
  }

  filterMethodsList() {
    
  }
}



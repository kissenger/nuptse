import { Component, ElementRef, ViewChildren, QueryList, ChangeDetectorRef, ViewEncapsulation, ViewChild, Renderer2, HostListener } from '@angular/core';
import { ScrollspyService } from '../../shared/services/scrollspy.service';
import { CommonModule } from '@angular/common';
import { MethodsComponent } from './methods/methods.component';
import { PracticeComponent } from "./practice/practice.component";
import { OptionsComponent } from "./options/options.component";
import { MethodDescriptorsArray, PracticeOptions } from '@shared/types';
import { NavService } from '@shared/services/nav.service';
import { Utility } from '@shared/classes/utilities.class';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MethodsComponent, PracticeComponent, OptionsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.None
})

export class HomeComponent {

  @ViewChildren('anchor') anchors!: QueryList<ElementRef>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  
  public methods: MethodDescriptorsArray = [];
  public options: PracticeOptions = new PracticeOptions;
  public numberOfBells?: number;
  public hideBackBtn = true;
  public hideFwdBtn  = true;
  public disableFwdBtn = false;
  public showPracticeComponent = false;
  public workingBell: string = '';

  constructor(
    public nav: NavService,
    private _scrollSpy: ScrollspyService,
    private _ref: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.nav.setAnchors(this.anchors);
    this.nav.scrollTo('home');
    this._scrollSpy.init(this.anchors, this.scrollContainer); 
    this._scrollSpy.intersectionEmitter.subscribe( (isect) => {
      if (isect.ratio > 0.2) {
        this.showPracticeComponent = isect.id === 'practice'
        this._ref.detectChanges();    // needed to fire ngClass, not sure why
      }
    })
  }

  onMethodsChange(ms: MethodDescriptorsArray) {
    this.methods = ms;
    if (ms.length > 0) {
      this.numberOfBells = Utility.nBells(ms[0].name);
    }
  }

  onOptionsChange(o: PracticeOptions) {
    this.options = o;
  }


}



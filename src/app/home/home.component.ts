import { Component, ElementRef, ViewChildren, QueryList, ChangeDetectorRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { MethodsComponent } from './methods/methods.component';
import { PracticeComponent } from "./practice/practice.component";
import { OptionsComponent } from "./options/options.component";
import { PracticeOptions } from '@shared/types';
import { ScrollspyService } from '@shared/services/scrollspy.service';
import { ScreenService } from '@shared/services/screen.service';
import { NavService } from '@shared/services/nav.service';
import { MethodList } from '@shared/classes/methodList.class';
import { SplashComponent } from "@shared/components/splash/splash.component";
import { HelpComponent } from "./helpMenu/help.component";

@Component({
  selector: 'app-home',
  imports: [MethodsComponent, OptionsComponent, PracticeComponent, SplashComponent, HelpComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.None
})

export class HomeComponent {

  @ViewChildren('anchor') anchors!: QueryList<ElementRef>;
  @ViewChild('rootContainer') rootContainer!: ElementRef;
  
  public methods: MethodList = new MethodList();
  public options: PracticeOptions = new PracticeOptions;
  public numberOfBells?: number;
  public hideBackBtn = true;
  public hideFwdBtn  = true;
  public disableFwdBtn = false;
  public showPracticeComponent = false;
  public suppressBobsOption = false;
  public workingBell: string = '';
  public showHelpMenu: boolean = false;

  constructor(
    public nav: NavService,
    private _scrollSpy: ScrollspyService,
    private _ref: ChangeDetectorRef,
    private _screen: ScreenService
  ) {}

  ngAfterViewInit(): void {
    this.nav.setAnchors(this.anchors);
    this.nav.scrollTo('home');
    this._scrollSpy.init(this.anchors, this.rootContainer); 
    this._scrollSpy.intersectionEmitter.subscribe( (isect) => {
      if (isect.ratio > 0.2) {
        this.showPracticeComponent = isect.id === 'practice';
        this._ref.detectChanges();    // needed to fire ngClass, not sure why
      }
    })
    this._screen.resize.subscribe( (width: number, height: number) => {
      this.nav.scrollTo(this.nav.activeAnchor);
    });
  }

  onMethodsChange(ms: MethodList) {
    this.methods = ms;
    if (this.methods.nBells) {
      this.numberOfBells = this.methods.nBells;
    }
    this.suppressBobsOption = this.methods.allMethodsHaveNoBobsFlag;
  }

  onOptionsChange(o: PracticeOptions) {
    this.options = o;
  }

  onShowHelp() {
    this.showHelpMenu = true;
    console.log(this.showHelpMenu)
  }


}



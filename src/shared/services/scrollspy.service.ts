
import { ElementRef, EventEmitter, Inject, Injectable, PLATFORM_ID, QueryList } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class ScrollspyService {

  public intersectionEmitter = new EventEmitter<{id: string, class: string, ratio: number}>();
  private _ob$: any;
  private _rootElement?: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  init(children: QueryList<ElementRef>, rootElement: ElementRef) {
    this._rootElement = rootElement;

    if(isPlatformBrowser(this.platformId)) {
      this._ob$ = new IntersectionObserver( (io: Array<IntersectionObserverEntry>) => {
        this.intersectHandler(io);
      }, {
        // root: null,
        root: this._rootElement.nativeElement,
        rootMargin: '0px', 
        threshold: [0.2]
      });
    }

    children.toArray().forEach( (child) => {
      this._ob$?.observe(child.nativeElement);
    })
  };

  intersectHandler(el: Array<IntersectionObserverEntry>) {
    el.forEach( (el) => {
      this.intersectionEmitter.emit({
        id: el.target.id, 
        class: el.target.className,
        ratio: el.intersectionRatio
      });
    });
  }
}

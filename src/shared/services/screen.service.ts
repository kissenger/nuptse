import { EventEmitter, inject, Inject, Injectable, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class ScreenService implements OnDestroy{

  public resize = new EventEmitter<{width: number, height: number}>();
  private _screenWidth: number = 0;
  private _screenHeight: number = 0;
  private _viewportChangeSubs: Subscription | undefined;
  private _viewportRuler = inject(ViewportRuler);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {
    if (isPlatformBrowser(this.platformId)) this.onResize();
    this._viewportChangeSubs = this._viewportRuler.change(200).subscribe(() => {
      this.ngZone.run(() => this.onResize());
    });
  }

  onResize() {
    const {width, height} = this._viewportRuler.getViewportSize();
    this._screenWidth = width;
    this._screenHeight = height;
    this.resize.emit({width, height});
  }

  get width() { return this._screenWidth; }
  get height() { return this._screenHeight; }

  ngOnDestroy(): void {
    this._viewportChangeSubs?.unsubscribe();
  }

}




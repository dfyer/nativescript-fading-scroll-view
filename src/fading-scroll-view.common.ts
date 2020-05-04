import { FadingScrollView as FadingScrollViewDefinition, Orientation, ScrollEventData } from "./fading-scroll-view";
import { ContentView, Property, makeParser, makeValidator, EventData, booleanConverter, CSSType } from "tns-core-modules/ui/content-view";
import { profile } from "tns-core-modules/profiling";

export * from "tns-core-modules/ui/content-view";

@CSSType("FadingScrollView")
export abstract class FadingScrollViewBase extends ContentView implements FadingScrollViewDefinition {
    private _scrollChangeCount: number = 0;
    public static scrollEvent = "scroll";

    public fadePercentage: number;

    public orientation: Orientation;
    public scrollBarIndicatorVisible: boolean;
    public isScrollEnabled: boolean;

    public addEventListener(arg: string, callback: any, thisArg?: any) {
        super.addEventListener(arg, callback, thisArg);

        if (arg === FadingScrollViewBase.scrollEvent) {
            this._scrollChangeCount++;
            this.attach();
        }
    }

    public removeEventListener(arg: string, callback: any, thisArg?: any) {
        super.removeEventListener(arg, callback, thisArg);

        if (arg === FadingScrollViewBase.scrollEvent) {
            this._scrollChangeCount--;
            this.dettach();
        }
    }

    @profile
    public onLoaded() {
        super.onLoaded();

        this.attach();
    }

    public onUnloaded() {
        super.onUnloaded();

        this.dettach();
    }

    private attach() {
        if (this._scrollChangeCount > 0 && this.isLoaded) {
            this.attachNative();
        }
    }

    private dettach() {
        if (this._scrollChangeCount === 0 && this.isLoaded) {
            this.dettachNative();
        }
    }

    protected attachNative() {
        //
    }

    protected dettachNative() {
        //
    }

    get horizontalOffset(): number {
        return 0;
    }

    get verticalOffset(): number {
        return 0;
    }

    get scrollableWidth(): number {
        return 0;
    }

    get scrollableHeight(): number {
        return 0;
    }

    public abstract scrollToVerticalOffset(value: number, animated: boolean);
    public abstract scrollToHorizontalOffset(value: number, animated: boolean);
    public abstract _onOrientationChanged();
    public abstract _onFadePercentageChanged();
}
export interface FadingScrollViewBase {
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    on(event: "scroll", callback: (args: ScrollEventData) => void, thisArg?: any);
}

const converter = makeParser<Orientation>(makeValidator("horizontal", "vertical"));
export const orientationProperty = new Property<FadingScrollViewBase, Orientation>({
    name: "orientation", defaultValue: "vertical", affectsLayout: true,
    valueChanged: (target: FadingScrollViewBase, oldValue: Orientation, newValue: Orientation) => {
        target._onOrientationChanged();
    },
    valueConverter: converter
});
orientationProperty.register(FadingScrollViewBase);

export const fadePercentageProperty = new Property<FadingScrollViewBase, number>({
  name: "fadePercentage", defaultValue: 0.3, affectsLayout: true,
  valueChanged: (target: FadingScrollViewBase, oldValue: number, newValue: number) => {
      target._onFadePercentageChanged();
  },
  valueConverter: (v) => {
    const x = parseFloat(v);
    if (x < 0 || x > 0.5) {
      throw new Error(`fadePercentage accepts values in the range [0, 0.5]. Value: ${v}`);
    }

    return x;
  }
})
fadePercentageProperty.register(FadingScrollViewBase);

export const scrollBarIndicatorVisibleProperty = new Property<FadingScrollViewBase, boolean>({
    name: "scrollBarIndicatorVisible", defaultValue: true,
    valueConverter: booleanConverter
});
scrollBarIndicatorVisibleProperty.register(FadingScrollViewBase);

export const isScrollEnabledProperty = new Property<FadingScrollViewBase, boolean>({
    name: "isScrollEnabled", defaultValue: true,
    valueConverter: booleanConverter
});
isScrollEnabledProperty.register(FadingScrollViewBase);

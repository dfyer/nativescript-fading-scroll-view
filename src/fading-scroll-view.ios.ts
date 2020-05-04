import { ScrollEventData } from "./fading-scroll-view";
import {
    View, layout, FadingScrollViewBase, scrollBarIndicatorVisibleProperty, isScrollEnabledProperty
} from "./fading-scroll-view.common";
import { ios as iosUtils } from "tns-core-modules/utils/utils";

export * from "./fading-scroll-view.common";

const majorVersion = iosUtils.MajorVersion;

class UIScrollViewDelegateImpl extends NSObject implements UIScrollViewDelegate {
    private _owner: WeakRef<FadingScrollView>;

    public static initWithOwner(owner: WeakRef<FadingScrollView>): UIScrollViewDelegateImpl {
        let impl = <UIScrollViewDelegateImpl>UIScrollViewDelegateImpl.new();
        impl._owner = owner;

        return impl;
    }

    public scrollViewDidScroll(sv: UIScrollView): void {
        let owner = this._owner.get();
        if (owner) {
            owner.notify(<ScrollEventData>{
                object: owner,
                eventName: "scroll",
                scrollX: owner.horizontalOffset,
                scrollY: owner.verticalOffset
            });
        }
    }

    public static ObjCProtocols = [UIScrollViewDelegate];
}

class FadingScrollViewImpl extends UIScrollView {
  private _fadePercentage: number;
  private _gradientLayer: CAGradientLayer = null;
  private _transparentColor: UIColor = UIColor.clearColor.CGColor;
  private _opaqueColor: UIColor = UIColor.blackColor.CGColor;

  public setGradientLayer() {
    this._opaqueColor = UIColor.blackColor.CGColor;
    this._transparentColor = UIColor.clearColor.CGColor;
    this._gradientLayer = CAGradientLayer.new();
  }

  public setFadePercentage(fadePercentage: number) {
    this._fadePercentage = fadePercentage;
  }

  public layoutSubviews() {
    super.layoutSubviews();

    const scrollViewHeight = this.frame.size.height;
    const scrollContentSizeHeight = this.contentSize.height;
    const scrollOffset = this.contentOffset.y;
    // console.log(scrollViewHeight)
    // console.log(scrollContentSizeHeight)
    // console.log(scrollOffset)
    const alphaTop = (scrollViewHeight >= scrollContentSizeHeight || scrollOffset <= 0) ? 1 : 0;
    const alphaBottom = (scrollViewHeight >= scrollContentSizeHeight
       || scrollOffset + scrollViewHeight >= scrollContentSizeHeight) ? 1 : 0
    // console.log(alphaTop)
    // console.log(alphaBottom)
    let topOpacity = UIColor.alloc().initWithWhiteAlpha(0, alphaTop).CGColor;
    let bottomOpacity = UIColor.alloc().initWithWhiteAlpha(0, alphaBottom).CGColor;

    // this.delegate = this;
    const maskLayer = CALayer.new();
    maskLayer.frame = this.bounds;

    // this.gradientLayer.frame = CGRectMake(this.bounds.origin.x, 0, this.bounds.size.width, this.bounds.size.height);
    // this.gradientLayer.colors = [this.topOpacity, this.opaqueColor, this.opaqueColor, this.bottomOpacity];
    // this.gradientLayer.locations = [0, NSNumber.alloc().initWithFloat(this.fadePercentage), NSNumber.alloc().initWithFloat(1 - this.fadePercentage), 1];
    // maskLayer.addSublayer(this.gradientLayer);

    // this._fadePercentage = 0.3;
    // if (this._opaqueColor == null) { this._opaqueColor = UIColor.blackColor.CGColor; }
    // if (this._transparentColor == null) { this._transparentColor = UIColor.clearColor.CGColor; }
    // if (this._gradientLayer == null) { this._gradientLayer = CAGradientLayer.new(); }

    this._gradientLayer.frame = CGRectMake(this.bounds.origin.x, 0, this.bounds.size.width, this.bounds.size.height);
    this._gradientLayer.colors = NSArray.arrayWithArray([topOpacity, this._opaqueColor, this._opaqueColor, bottomOpacity]);
    this._gradientLayer.locations = NSArray.arrayWithArray([0, this._fadePercentage, 1 - this._fadePercentage, 1]);
    // this._gradientLayer.locations = [NSNumber.alloc().initWithFloat(0.0),
    //                                  NSNumber.alloc().initWithFloat(this._fadePercentage),
    //                                  NSNumber.alloc().initWithFloat(1 - this._fadePercentage),
    //                                  NSNumber.alloc().initWithFloat(1.0)];
    maskLayer.addSublayer(this._gradientLayer);

    this.layer.mask = maskLayer
  }
}

export class FadingScrollView extends FadingScrollViewBase {
    public nativeViewProtected: FadingScrollViewImpl;
    private _contentMeasuredWidth: number = 0;
    private _contentMeasuredHeight: number = 0;
    private _delegate: UIScrollViewDelegateImpl;

    public createNativeView() {
        const view = FadingScrollViewImpl.new();

        return view;
    }

    initNativeView() {
        super.initNativeView();
        this.updateScrollBarVisibility(this.scrollBarIndicatorVisible);
        this._setNativeClipToBounds();
        this._setGradientLayer();
        this._setFadePercentage();
    }

    _setNativeClipToBounds() {
        // Always set clipsToBounds for scroll-view
        this.nativeViewProtected.clipsToBounds = true;
    }

    _setGradientLayer() {
      this.nativeViewProtected.setGradientLayer();
    }

    _setFadePercentage() {
      this.nativeViewProtected.setFadePercentage(this.fadePercentage);
    }

    protected attachNative() {
        this._delegate = UIScrollViewDelegateImpl.initWithOwner(new WeakRef(this));
        this.nativeViewProtected.delegate = this._delegate;
    }

    protected dettachNative() {
        this.nativeViewProtected.delegate = null;
    }

    protected updateScrollBarVisibility(value) {
        if (!this.nativeViewProtected) {
            return;
        }
        if (this.orientation === "horizontal") {
            this.nativeViewProtected.showsHorizontalScrollIndicator = value;
        } else {
            this.nativeViewProtected.showsVerticalScrollIndicator = value;
        }
    }

    get horizontalOffset(): number {
        return this.nativeViewProtected ? this.nativeViewProtected.contentOffset.x : 0;
    }

    get verticalOffset(): number {
        return this.nativeViewProtected ? this.nativeViewProtected.contentOffset.y : 0;
    }

    get scrollableWidth(): number {
        if (!this.nativeViewProtected || this.orientation !== "horizontal") {
            return 0;
        }

        return Math.max(0, this.nativeViewProtected.contentSize.width - this.nativeViewProtected.bounds.size.width);
    }

    get scrollableHeight(): number {
        if (!this.nativeViewProtected || this.orientation !== "vertical") {
            return 0;
        }

        return Math.max(0, this.nativeViewProtected.contentSize.height - this.nativeViewProtected.bounds.size.height);
    }

    [isScrollEnabledProperty.getDefault](): boolean {
        return this.nativeViewProtected.scrollEnabled;
    }
    [isScrollEnabledProperty.setNative](value: boolean) {
        this.nativeViewProtected.scrollEnabled = value;
    }

    [scrollBarIndicatorVisibleProperty.getDefault](): boolean {
        return true;
    }
    [scrollBarIndicatorVisibleProperty.setNative](value: boolean) {
        this.updateScrollBarVisibility(value);
    }

    public scrollToVerticalOffset(value: number, animated: boolean) {
        if (this.nativeViewProtected && this.orientation === "vertical" && this.isScrollEnabled) {
            const bounds = this.nativeViewProtected.bounds.size;
            this.nativeViewProtected.scrollRectToVisibleAnimated(CGRectMake(0, value, bounds.width, bounds.height), animated);
        }
    }

    public scrollToHorizontalOffset(value: number, animated: boolean) {
        if (this.nativeViewProtected && this.orientation === "horizontal" && this.isScrollEnabled) {
            const bounds = this.nativeViewProtected.bounds.size;
            this.nativeViewProtected.scrollRectToVisibleAnimated(CGRectMake(value, 0, bounds.width, bounds.height), animated);
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call measure because it will measure content twice.
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const child = this.layoutView;
        this._contentMeasuredWidth = this.effectiveMinWidth;
        this._contentMeasuredHeight = this.effectiveMinHeight;

        if (child) {
            let childSize: { measuredWidth: number; measuredHeight: number };
            if (this.orientation === "vertical") {
                childSize = View.measureChild(this, child, widthMeasureSpec, layout.makeMeasureSpec(0, layout.UNSPECIFIED));
            } else {
                childSize = View.measureChild(this, child, layout.makeMeasureSpec(0, layout.UNSPECIFIED), heightMeasureSpec);
            }

            this._contentMeasuredWidth = Math.max(childSize.measuredWidth, this.effectiveMinWidth);
            this._contentMeasuredHeight = Math.max(childSize.measuredHeight, this.effectiveMinHeight);
        }

        const widthAndState = View.resolveSizeAndState(this._contentMeasuredWidth, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(this._contentMeasuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        const insets = this.getSafeAreaInsets();
        let width = (right - left - insets.right - insets.left);
        let height = (bottom - top - insets.bottom - insets.top);

        const nativeView = this.nativeViewProtected;

        if (majorVersion > 10) {
            // Disable automatic adjustment of scroll view insets
            // Consider exposing this as property with all 4 modes
            // https://developer.apple.com/documentation/uikit/uiscrollview/contentinsetadjustmentbehavior
            nativeView.contentInsetAdjustmentBehavior = 2;
        }

        let scrollWidth = width + insets.left + insets.right;
        let scrollHeight = height + insets.top + insets.bottom;
        if (this.orientation === "horizontal") {
            scrollWidth = Math.max(this._contentMeasuredWidth + insets.left + insets.right, scrollWidth);
            width = Math.max(this._contentMeasuredWidth, width);
        }
        else {
            scrollHeight = Math.max(this._contentMeasuredHeight + insets.top + insets.bottom, scrollHeight);
            height = Math.max(this._contentMeasuredHeight, height);
        }

        nativeView.contentSize = CGSizeMake(layout.toDeviceIndependentPixels(scrollWidth), layout.toDeviceIndependentPixels(scrollHeight));
        View.layoutChild(this, this.layoutView, insets.left, insets.top, insets.left + width, insets.top + height);
    }

    public _onOrientationChanged() {
        this.updateScrollBarVisibility(this.scrollBarIndicatorVisible);
    }

    public _onFadePercentageChanged() {
      if (this.nativeViewProtected) {
        this._setFadePercentage();
      }
    }
}

// FadingScrollView.prototype.recycleNativeView = "auto";

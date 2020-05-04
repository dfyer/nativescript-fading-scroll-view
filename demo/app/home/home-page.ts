import { FadingScrollView } from 'nativescript-fading-scroll-view';
/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { HomeViewModel } from "./home-view-model";

import { EventData } from "tns-core-modules/ui/content-view";
import { ScrollEventData } from "nativescript-fading-scroll-view/fading-scroll-view";

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;

    page.bindingContext = new HomeViewModel();
}

export function onScroll(args: ScrollEventData) {
  // console.log(args.scrollY);
}

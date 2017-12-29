/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

import { EventData } from 'data/observable';
import { Page } from 'ui/page';
import { VideoChat } from './main-view-model';

export function navigatingTo(args: EventData) {
    let page = <Page>args.object;
    page.bindingContext = new VideoChat(page);
}

import { ViewConfig } from './ViewConfig.Interface';

interface DialogConfig extends ViewConfig {
    headerTemplate: string;
    templates: string[];
    footerTemplate: string;
}

export { DialogConfig };
 
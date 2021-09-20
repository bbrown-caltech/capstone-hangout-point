import { UIBase } from '../core/UIBase';

enum MenuAlignmentArgs {
    Left = 0,
    Right = 1
}

enum MenuItemCommandTypeArgs {
    None = -1,
    Route = 0,
    Method = 1
}

interface MenuItem {
    Scope: object;
    CommandType: MenuItemCommandTypeArgs;
    Command: string;
    MenuIcon: string;
    LabelText: string;
    ApplySeparator: boolean;
    Arguments: any[];
}

class ElementLocation {
    X: string;
    Y: string;
    
    constructor(x: number, y: number) {
        this.X = x + 'px';
        this.Y = y + 'px';
    }
    
}

class Menu {
    protected Container: HTMLElement;
    
    constructor(protected items: MenuItem[],
                protected Alignment: MenuAlignmentArgs = MenuAlignmentArgs.Left) {
        this.init();
    }
    
    private init(): void {
        const self = this;
        
        this.Container = document.createElement('ng-menu');
        
        for (const item of this.items) {
            const menuItem: HTMLElement = document.createElement('menu-item');
            menuItem.innerHTML = `${item.MenuIcon}${(item.MenuIcon !== '' ? '&nbsp;&nbsp;' : '')}${item.LabelText}`;
            if (item.CommandType === MenuItemCommandTypeArgs.None) {
                menuItem.classList.add('menu-item-no-command');
            }
            if (item.ApplySeparator) {
                menuItem.style.borderTop = 'solid 1px #444';
            }
            this.Container.appendChild(menuItem);
            menuItem.onclick = (ev: MouseEvent) => {
                if (item.CommandType === MenuItemCommandTypeArgs.Method && item.Scope) {
                    item.Scope[item.Command](item.Arguments);
                } else if (item.CommandType === MenuItemCommandTypeArgs.Route && item.Scope) {
                    history.pushState({selector: 'item-selector'}, 'Menu Item Selection', `${item.Command}`);
                }
            }
        }
        
    }
    
    static showMenu(parent: HTMLElement, menu: Menu): void {
        if (!menu) { return; }
        
        const coords: ElementLocation = Menu.GetElementCoordinates(parent);
        const body: HTMLBodyElement = document.getElementsByTagName('body')[0];
        
        menu.Container.style.position = 'absolute';
        menu.Container.style.top = coords.Y;
        menu.Container.style.left = coords.X;
        
        body.appendChild(menu.Container);
        
        setTimeout(() => {
            
            body.onclick = (ev: MouseEvent) => {
                const parent: Node = menu.Container.parentNode;
                parent.removeChild(menu.Container);
                body.onclick = null;
            }
            
        }, 300);
        
    }
    
    private static GetElementCoordinates(parent: HTMLElement, offsetWidth?: boolean, childWidth?: number): ElementLocation {
        const rect = parent.getBoundingClientRect();
        const docEl = document.documentElement;

        const elemTop = Math.ceil(rect.top + window.pageYOffset - docEl.clientTop);
        let elemLeft = Math.ceil(rect.left + window.pageXOffset - docEl.clientLeft);

        const elemHeight = parent.clientHeight;

        if (offsetWidth && childWidth && offsetWidth === true) {
            elemLeft = elemLeft - Math.abs(parent.clientWidth - childWidth);
        }

        return new ElementLocation(elemLeft, (elemTop + elemHeight + 2));
    }
    
}

export { Menu, MenuItem, MenuItemCommandTypeArgs, MenuAlignmentArgs };

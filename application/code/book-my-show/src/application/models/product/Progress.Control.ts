import { Step } from './Progress.Step.Interface';
import { CustomEvent } from '../../../framework/models/CustomEvent.Interface';

class ProgressControl {
    public steps: Step[];
    public previousButton: HTMLButtonElement;
    public nextButton: HTMLButtonElement;
    
    private displayed: boolean;
    private display: HTMLDivElement;
    private container: HTMLElement;
    private stepIndex: number;
    private imageColors = ['#c0c0c0', '#010002', '#48d72f', '#1717c0'];
    
    constructor() {
        this.steps = new Array<Step>();
        this.stepIndex = -1;
    }
    
    init(container?: HTMLElement) {
        this.display = this.createDisplay();
        this.container = container;
        
        if (this.container) {
            this.container.appendChild(this.display);
            this.displayed = true;
        }
        
        window.addEventListener('selectprevious', this.movePrevious);
        window.addEventListener('selectnext', this.moveNext);
        
    }
    
    dispose() {
        this.stepIndex = -1;
        this.displayed = false;
        
        window.removeEventListener('selectprevious', this.movePrevious);
        window.removeEventListener('selectnext', this.moveNext);
        
        if (this.display) {
            try {
                if (this.container) {
                    this.container.removeChild(this.display);
                } else {
                    document.getElementsByTagName('body')[0].removeChild(this.display);
                }
            } catch {
                //  Suppress the Error
            }
        }
        
    }
    
    private movePrevious(evt: CustomEvent<ProgressControl>) {
        const self = evt.detail;
        
        if (self.stepIndex > 0) {
            const colorIdx: number = (self.steps[self.stepIndex].completed === true ? 2 : 0);
            self.steps[self.stepIndex].image.setAttributeNS(null, 'fill', self.imageColors[colorIdx]);
        }
        
        self.stepIndex--
        self.stepIndex = (self.stepIndex > 0 ? self.stepIndex : 0);
        self.steps[self.stepIndex].image.setAttributeNS(null, 'fill', self.imageColors[3]);
    }
    
    private moveNext(evt: CustomEvent<ProgressControl>) {
        const self = evt.detail;
        
        if (!self.displayed) {
            self.displayed = true;
            document.getElementsByTagName('body')[0].appendChild(self.display);
        }
        
        if (self.stepIndex > -1) {
            self.steps[self.stepIndex].completed = true;
            self.steps[self.stepIndex].image.setAttributeNS(null, 'fill', self.imageColors[2]);
        }
        
        self.stepIndex++;
        self.stepIndex = (self.stepIndex < self.steps.length ? self.stepIndex : self.steps.length - 1);
        
        if (self.steps[self.stepIndex].completed) {
            self.steps[self.stepIndex].image.setAttributeNS(null, 'fill', self.imageColors[3]);
        } else {
            self.steps[self.stepIndex].image.setAttributeNS(null, 'fill', self.imageColors[1]);
        }
        
    }
    
    private createDisplay(): HTMLDivElement {
        this.previousButton = this.createButton('<i class="fas fa-chevron-left"></i>', 'Title',
                                                ['btn', 'btn-crisp', 'btn-med', 'float-left', 'selection-navigation-button'], undefined);
        this.nextButton = this.createButton('<i class="fas fa-chevron-right"></i>', 'Title',
                                                ['btn', 'btn-crisp', 'btn-med', 'float-right', 'selection-navigation-button'], undefined);
        
        const panelWidths: string[] = ['150px', '235px', '315px'];
        const div: HTMLDivElement = document.createElement('div');
        div.classList.add('progress-panel');
        
        if (this.steps.length < 4) {
            div.style.width = panelWidths[this.steps.length - 1];
        }
        
        const row: HTMLDivElement = document.createElement('div');
        row.classList.add('div-row');
        
        const btnCol1: HTMLDivElement = document.createElement('div');
        btnCol1.classList.add('div-col-01');
        btnCol1.appendChild(this.previousButton);
        row.appendChild(btnCol1);
        
        const btnCol2: HTMLDivElement = document.createElement('div');
        btnCol2.classList.add('div-col-01');
        btnCol2.appendChild(this.nextButton);
        
        const colClasses: string[] = this.getStepClassArray();
        let idx: number = 0;
        for (const step of this.steps) {
            const svg: SVGElement = this.createSvg();
            const cont: HTMLDivElement = this.createSvgContainer();
            const label: HTMLDivElement = document.createElement('div');
            const colML: string[][] = [['20px'], ['15px', '5px'], ['10px', '5px', '']];
            const colMR: string[][] = [['20px'], ['', '10px'], ['', '', '5px']];
            
            step.col = document.createElement('div');
            step.image = this.createPath();
            
            if (this.steps.length < 4) {
                step.col.style.width = '68.8px';
                step.col.style.marginLeft = colML[this.steps.length -1][idx];
                step.col.style.marginRight = colMR[this.steps.length -1][idx];
            }
            
            step.col.classList.add(colClasses[idx++]);
            
            label.classList.add('progress-label');
            label.innerHTML = step.name;
            
            cont.appendChild(svg);
            cont.appendChild(label);
            
            svg.appendChild(step.image);
            
            step.col.appendChild(cont);
            row.appendChild(step.col);
            
        }
        
        row.appendChild(btnCol2);
        div.appendChild(row);
        
        return div;
        
    }
    
    private createSvg(): SVGElement {
        const svg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        
        svg.setAttributeNS(null, 'viewBox', '0 0 50 50');
        svg.setAttributeNS(null, 'width', '50');
        svg.setAttributeNS(null, 'height', '50');
        svg.style.marginLeft = '10px';
        svg.style.display = 'block';
        
        return svg;
        
    }
    
    private createPath(): SVGPathElement {
        const path: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        path.setAttributeNS(null, 'fill', this.imageColors[0]);
        path.setAttributeNS(null, 'd', `M 49.550781 11.015625 C 48.558594 9.167969 46.261719 8.472656 44.414062 9.464844 C 42.199219 10.648438 40.105469 
        11.871094 38.105469 13.148438 L 38.105469 8.003906 C 38.105469 6.867188 37.1875 5.945312 36.050781 5.945312 L 2.054688 5.945312 C 0.917969 5.945312 
        0 6.867188 0 8.003906 L 0 42 C 0 43.132812 0.917969 44.054688 2.054688 44.054688 L 36.046875 44.054688 C 37.1875 44.054688 38.105469 43.132812 38.105469 
        42 L 38.105469 22.339844 C 41.128906 20.113281 44.359375 18.101562 47.996094 16.152344 C 49.84375 15.164062 50.539062 12.863281 49.550781 11.015625 Z 
        M 33.996094 39.941406 L 4.113281 39.941406 L 4.113281 10.058594 L 33.996094 10.058594 L 33.996094 15.953125 C 29.910156 18.929688 26.164062 22.253906 
        22.46875 26.160156 C 22.042969 25.589844 21.605469 25.011719 21.152344 24.40625 C 20.214844 23.152344 19.148438 21.730469 17.902344 20.125 C 16.617188 
        18.472656 14.234375 18.171875 12.578125 19.457031 C 10.921875 20.742188 10.625 23.128906 11.910156 24.78125 C 13.113281 26.332031 14.113281 27.664062 
        15.078125 28.953125 C 16.46875 30.808594 17.78125 32.5625 19.339844 34.453125 C 20.050781 35.3125 21.101562 35.816406 22.21875 35.832031 C 22.234375 
        35.832031 22.25 35.832031 22.265625 35.832031 C 23.363281 35.832031 24.410156 35.355469 25.132812 34.527344 C 28.089844 31.121094 30.972656 28.207031 
        33.996094 25.609375 Z M 33.996094 39.941406`);
    
        return path;
    
    }
    
    private createSvgContainer(): HTMLDivElement {
        const cont: HTMLDivElement = document.createElement('div');
        
        cont.style.padding = '3px';
        cont.style.width = '56px';
        cont.style.height = '56px';
        
        return cont;
        
    }
    
    private createButton(html: string, title: string, classList: string[],
        handler: (evt: MouseEvent) => void): HTMLButtonElement {
        const button: HTMLButtonElement = document.createElement('button');

        button.title = title;
        button.innerHTML = html;
        button.onclick = handler;

        if (classList) {
        for (const c of classList) {
        button.classList.add(c);
        }
        }

        return button;

    }

    private getStepClassArray(): string[] {
        
        if (this.steps.length === 1) {
            return ['div-col-08'];
        }
        
        if (this.steps.length === 2) {
            return ['div-col-04', 'div-col-04'];
        }
        
        if (this.steps.length === 3) {
            return ['div-col-025', 'div-col-03', 'div-col-025'];
        }
        
        return ['div-col-02', 'div-col-02', 'div-col-02', 'div-col-02'];
        
    }
    
}

export { ProgressControl };

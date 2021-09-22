
class Paginator {
    private currentPage: number = 0;
    private data: any[];
    
    private container: HTMLElement;
    private paginationDisplay: HTMLElement;
    
    private first: HTMLButtonElement;
    private previous: HTMLButtonElement;
    private next: HTMLButtonElement;
    private last: HTMLButtonElement;
    
    public totalPages: number = 0;
    
    public paged: (data: any[]) => void;
    
    constructor(elementId: string, private pageSize: number = 5) {
        this.container = document.getElementById(elementId);
    }
    
    getPageSize(): number {
        return this.pageSize;
    }
    setPageSize(value: number) {
        this.pageSize = value;
    }
    
    setData(data: any[]) {
        const self = this;
        
        self.data = data;
        self.totalPages = (data ? Math.ceil(data.length / self.pageSize) : 0);
        self.currentPage = 0;
        
        const startIndex = self.currentPage * self.pageSize;
        const endIndex = (startIndex + self.pageSize) > self.data.length ? self.data.length : (startIndex + self.pageSize);
        const pageData: any[] = self.data.slice(startIndex, endIndex);
        
        console.log('Pagination Setting Data: ', self.data);
        
        if (self.paged)
        {
            console.log('Paging data...');
            self.paged(pageData);
        }

    }
    
    init() {
        const self = this;
        self.paginationDisplay = document.createElement('pag-display');
        
        if (self.paginationDisplay === undefined || self.paginationDisplay === null) {
            self.paginationDisplay = document.createElement('div');
        }
        
        self.first = this.createNavigationButton("<i class=\"fa fa-angle-double-left\" aria-hidden=\"true\"></i>",
        (ev: MouseEvent) => {
                                                                   
            if (self.data)
            {
                self.currentPage = 0;

                const startIndex = self.currentPage * self.pageSize;
                const endIndex = (startIndex + self.pageSize) > self.data.length ? self.data.length : (startIndex + self.pageSize);
                const data: any[] = self.data.slice(startIndex, endIndex);
                // console.log('Paginator Page: ', data);
                self.paginationDisplay.innerHTML = "Page " + (self.currentPage + 1) + " of " + self.totalPages;

                if (self.paged)
                {
                    self.paged(data);
                }

            }

        });
        self.previous = this.createNavigationButton("<i class=\"fa fa-angle-left\" aria-hidden=\"true\"></i>",
        (ev: MouseEvent) => {
            
            if (self.data)
            {
                self.currentPage = (self.currentPage - 1) < 0 ? 0 : self.currentPage - 1;

                var startIndex = self.currentPage * self.pageSize;
                var endIndex = (startIndex + self.pageSize) > self.data.length ? self.data.length : (startIndex + self.pageSize);
                const data: any[] = self.data.slice(startIndex, endIndex);
                
                self.paginationDisplay.innerHTML = "Page " + (self.currentPage + 1) + " of " + self.totalPages;

                if (self.paged)
                {
                    self.paged(data);
                }

            }

        });
        self.next = this.createNavigationButton("<i class=\"fa fa-angle-right\" aria-hidden=\"true\"></i>",
        (ev: MouseEvent) => {
            
            if (self.data)
            {
                self.currentPage = (self.currentPage + 2) > self.totalPages ? self.totalPages - 1 : self.currentPage + 1;

                var startIndex = self.currentPage * self.pageSize;
                var endIndex = (startIndex + self.pageSize) > self.data.length ? self.data.length : (startIndex + self.pageSize);
                const data: any[] = self.data.slice(startIndex, endIndex);
                
                self.paginationDisplay.innerHTML = "Page " + (self.currentPage + 1) + " of " + self.totalPages;

                if (self.paged)
                {
                    self.paged(data);
                }

            }

        });
        self.last = this.createNavigationButton("<i class=\"fa fa-angle-double-right\" aria-hidden=\"true\"></i>",
        (ev: MouseEvent) => {
            
            if (self.data)
            {
                self.currentPage = self.totalPages - 1;

                var startIndex = self.currentPage * self.pageSize;
                var endIndex = (startIndex + self.pageSize) > self.data.length ? self.data.length : (startIndex + self.pageSize);
                const data: any[] = self.data.slice(startIndex, endIndex);
                
                self.paginationDisplay.innerHTML = "Page " + (self.currentPage + 1) + " of " + self.totalPages;

                if (self.paged)
                {
                    self.paged(data);
                }

            }

        });
        //
        
        self.container.appendChild(self.first);
        self.container.appendChild(self.previous);
        self.container.appendChild(self.paginationDisplay);
        self.container.appendChild(self.next);
        self.container.appendChild(self.last);
        
        self.first.click();
        
    }
    
    refresh(data: any[]) {
        this.data = (data ? data : []);
        this.totalPages = (data ? Math.ceil(data.length / this.pageSize) : 0);
        this.currentPage = (this.currentPage >= this.totalPages ? this.totalPages - 1 : this.currentPage);
        
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = (startIndex + this.pageSize) > this.data.length ? this.data.length : (startIndex + this.pageSize);
        const displayData: any[] = this.data.slice(startIndex, endIndex);
        
        if (this.paginationDisplay === undefined || this.paginationDisplay === null) {
            this.paginationDisplay = document.createElement('div');
        }
        
        this.paginationDisplay.innerHTML = "Page " + (this.currentPage + 1) + " of " + this.totalPages;

        if (this.paged)
        {
            this.paged(displayData);
        }

    }
    
    resize(size: number) {
        this.pageSize = (size > 0 ? size : this.pageSize);
        this.refresh(this.data);
    }
    
    dispose() {
        this.first.onclick = null;
        this.previous.onclick = null;
        this.next.onclick = null;
        this.last.onclick = null;
        while(this.container.children.length > 0) {
            this.container.removeChild(this.container.children.item(0));
        }
    }
    
    private createNavigationButton(html: string, clickHandler: (ev: MouseEvent) => void): HTMLButtonElement {
        var button: HTMLButtonElement = document.createElement("button");

        button.classList.add("btn");
        button.classList.add("btn-crisp");
        button.classList.add("btn-small");

        button.innerHTML = html;

        button.onclick = clickHandler;

        return button;

    }

}

export { Paginator };

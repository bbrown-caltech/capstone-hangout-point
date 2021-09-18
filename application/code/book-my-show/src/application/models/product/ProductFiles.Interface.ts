
interface IFile {
    name: string;
    fileType: string;
    fileData: string;
}

interface IProductFiles {
    productId: number;
    files: IFile[];
}

export { IFile, IProductFiles };
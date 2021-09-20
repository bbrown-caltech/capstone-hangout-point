
interface INewComment {
    text: string;
}

interface IComment extends INewComment {
    commentDate: string;
    enteredBy: string;
}

interface IProductComments {
    productId: number;
    comments: IComment[];
}

export { INewComment, IComment, IProductComments };
import { GenericClassDecorator } from './GenericClassDecorator';
import { Type } from './Type';

const Service = () : GenericClassDecorator<Type<object>> => {
    return (target: Type<object>) => {
        // console.log('Inside Service...');
        // console.log(target);
        // const instance = new target(new Person('Mickey', 'Mouse'));
        // console.log(instance["showName"]());
    }
}

export { Service };

export class Variables {

    constructor() {
        this.vars.childrenCount = 0;
        this.vars.elementCount = 0;
    }

    public reset() {
        this.vars.childrenCount = 0;
        this.vars.elementCount = 0;
    }

    vars = {
        childrenCount: 0,
        elementCount: 0,
    };

    children = this.__const(this.vars.childrenCount, 'children')
    element = this.__const(this.vars.elementCount, 'element')

    private __const(counter: number, type: 'children' | 'element'): { last: () => string, next: () => string } {
        return {
            last: () => {
                return type + counter;
            },
            next: () => {
                counter++;
                return type + counter;
            }
        }
    }

}

const Vars = new Variables();
export default Vars;
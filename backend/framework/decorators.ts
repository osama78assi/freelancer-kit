export class Decorators {
    // Decorator to mark the function as an endpoint
    public static RequestHandler(
        target: Object,
        key: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        const original: Function = descriptor.value;
        
        // When we pass the function to express router it loses the 'this' refrence. So this should work
        const desc: PropertyDescriptor = {
            get() {
                // We pass it from the controller so do that in the get method
                return original.bind(this);
            },
        };

        return desc;
    }
}
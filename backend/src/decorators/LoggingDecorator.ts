export function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        const start = Date.now();
        const argsStr = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg).substring(0, 100);
            }
            return String(arg);
        }).join(', ');

        console.log(`[${new Date().toISOString()}] 🔵 ${propertyKey}(${argsStr})`);

        try {
            const result = await originalMethod.apply(this, args);
            const duration = Date.now() - start;
            console.log(`[${new Date().toISOString()}] ✅ ${propertyKey} completed in ${duration}ms`);
            return result;
        } catch (error) {
            const duration = Date.now() - start;
            console.error(`[${new Date().toISOString()}] ❌ ${propertyKey} failed after ${duration}ms:`, error);
            throw error;
        }
    };

    return descriptor;
}
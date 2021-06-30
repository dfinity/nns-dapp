export const retryAsync = async <T>(func: () => Promise<T>, maxAttempts: number) : Promise<T> => {
    let attempt = 0;
    while (true) {
        try {
            return await func();
        } catch (e) {
            if (++attempt >= maxAttempts) {
                throw e;
            }
        }
    }
}
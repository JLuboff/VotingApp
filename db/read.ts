
export const allPolls = async () : Promise<Array<any>> => {
    try {
        
    } catch (error) {
        error.function = error.function ? ['read.allPolls', ...error.function] : [...error.function];
        throw error;
    }
}
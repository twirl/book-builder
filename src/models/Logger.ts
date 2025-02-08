export interface Logger {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (...args: any[]) => void;
}

export enum LogLevel {
    DEBUG = 10,
    ERROR = 20
}

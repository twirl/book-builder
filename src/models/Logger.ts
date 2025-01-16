export interface Logger {
    debug: (...args: any[]) => void;
    error: (...args: any[]) => void;
}

export enum LogLevel {
    DEBUG = 10,
    ERROR = 20
}

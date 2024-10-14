import { Root } from 'hast';

export interface Chapter {
    title: string;
    anchor: string;
    counter: number;
    ast: Root;
}

import {targetBlankLinkRenderer} from './utils';
import type { marked as markedTypes, Renderer } from "marked";

type Marked = typeof markedTypes;

export const renderer = (marked: Marked): Renderer => {
    const renderer = new marked.Renderer();
    // custom link renderer
    renderer.link = targetBlankLinkRenderer;
    return renderer;
};

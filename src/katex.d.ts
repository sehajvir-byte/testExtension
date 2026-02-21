declare module 'katex/dist/contrib/auto-render.js' {
  export interface AutoRenderOptions {
    delimiters?: Array<{ left: string; right: string; display: boolean }>;
    ignoredTags?: string[];
    ignoredClasses?: string[];
    errorCallback?: (msg: string, err: Error) => void;
    macros?: { [customMacro: string]: string };
    throwOnError?: boolean;
    errorColor?: string;
    strict?: boolean | string | Function;
    trust?: boolean | Function;
  }

  export default function renderMathInElement(
    elem: HTMLElement,
    options?: AutoRenderOptions
  ): void;
}
import { camelCase } from "@aurelia/kernel";
import { bindable, customElement } from "@aurelia/runtime-html";

@customElement({
  name: 'result-viewer',
  template: `<template style="display: block"><iframe ref=iframe title.bind="title" style="width: 100%; height: 100%; border: 0;">`
})
export class ResultViewer {

  @bindable title: string = '';
  @bindable code: string = '';
  @bindable template: string = '';
  @bindable styles: string[] = [];

  readonly iframe!: HTMLIFrameElement;
  private file: IFile = { path: '', content: '', dispose: () => {} };

  attached() {
    this.refresh(generateFile(this.code, this.template, this.styles));
  }

  detached() {
    this.file.dispose();
  }

  refresh(file: IFile) {
    this.file.dispose();
    this.file = file;
    this.iframe.src = file.path;
  }

  private refreshId: number = 0;
  propertyChanged() {
    clearTimeout(this.refreshId);
    this.refreshId = setTimeout(() => {
      try {
        this.refresh(generateFile(this.code, this.template, this.styles));
      } catch (ex) {
        console.info(ex);
      }
    }, 250);
  }
}

interface IFile {
  readonly path: string;
  readonly content: string;
  dispose(): void;
}

interface IParsedScript {
  lines: string[],
  mainClass: string;
}

function generateFile(code: string, template: string, styles: string[]): IFile {
  const html = generateHtml(code, template, styles);
  const blob = new Blob([html], { type: 'text/html' });
  const path = URL.createObjectURL(blob);
  return {
    path,
    content: html,
    dispose: () => { URL.revokeObjectURL(path); }
  };
}

function generateHtml(code: string, template: string, styles: string[]) {
  const lines = code ? code.split('\n') : [];
  const pkgs = lines.map(l => getImportedPackage(l)).filter(Boolean) as string[];
  const script: IParsedScript = lines.length > 0 ? addBootScript(ensureCustomElement(lines, template)) : { lines: [], mainClass: '' };
  return `<html><head>` +
    `<script type="importmap">${createImportMap(pkgs)}</script>` +
    `<script type="module">${script.lines.join('\n')}</script>` +
    '<style>html,body {margin: 0; padding-top: 4px;}html {font-family: Helvetica, sans-serif;}</style>' +
    `<style>${styles.join('\n')}</style>` +
  `</head><body>` +
  `</body></html>`;
}

function addBootScript(script: IParsedScript): IParsedScript {
  return {
    lines: script.lines.concat([
      'import { DI as __DI, Registration as __R } from "@aurelia/kernel";',
      'import { StandardConfiguration as __SC, Aurelia as __Au, IPlatform as __IP } from "@aurelia/runtime-html";',
      "import { BrowserPlatform as __BP } from '@aurelia/platform-browser';",
      '(() => {',
        'const PLATFORM = window.PLATFORM = __BP.getOrCreate(globalThis);',
        'const ct = __DI.createContainer().register(__R.instance(__IP, PLATFORM), __SC);',
        `new __Au(ct).app({ host: document.body, component: ${script.mainClass} }).start();`,
      '})();'
    ]),
    mainClass: script.mainClass
  }
}

function ensureCustomElement(lines: string[], template: string) {
  let className: string | undefined;
  for (const l of lines) {
    const match = l.match(/^\s*export\s+class\s+([a-zA-Z_$][a-zA-Z\d_$]*)\s*{\s*$/);
    if (match) {
      className = match[1];
      break;
    }
  }
  if (!className) {
    throw new Error('Unable to find a custom element');
  }
  return {
    lines: lines.concat([
      'import { CustomElement as __CE } from "@aurelia/runtime-html";',
      `const __template = ${JSON.stringify(`${template}`)};`,
      `if (!__CE.isType(${className})) __CE.define({ name: '${camelCase(className)}', template: __template }, ${className});`
    ]),
    mainClass: className
  };
}

function createImportMap(packages: string[]) {
  return JSON.stringify({
    imports: Object.assign(packages
      .reduce((all, pkg) => {
        all[pkg] = `https://unpkg.com/${isAureliaPkg(pkg) ? `${pkg}@dev`: pkg}`;
        return all;
      }, {}), {
        "@aurelia/kernel": "https://unpkg.com/@aurelia/kernel@dev/dist/bundle/index.js",
        "@aurelia/runtime": "https://unpkg.com/@aurelia/runtime@dev/dist/bundle/index.js",
        "@aurelia/runtime-html": "https://unpkg.com/@aurelia/runtime-html@dev/dist/bundle/index.js",
        "@aurelia/platform": "https://unpkg.com/@aurelia/platform@dev/dist/bundle/index.js",
        "@aurelia/platform-browser": "https://unpkg.com/@aurelia/platform-browser@dev/dist/bundle/index.js",
        "@aurelia/metadata": "https://unpkg.com/@aurelia/metadata@dev/dist/bundle/index.js",
      }),
  }, undefined, 2);
}

function isAureliaPkg(pkg: string) {
  return pkg === 'aurelia' || pkg.startsWith('@aurelia');
}

function getImportedPackage(line: string): string | null {
  return line.match(/^\s*import\s+(?:.*?)\s+from\s+['"](.*)['"]\s*;?\s*$/)?.[1] ?? null;
}

/// <reference types="react-scripts" />
declare module "quagga" {
  export function init(...f: any): any;
  export function start(...f: any): any;
  export function onDetected(...f: any): any;
  export function onProcessed(...f: any): any;
  export function stop(): any;
  export const canvas:any;
  export const ImageDebug:any;
}

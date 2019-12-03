import React, { useCallback, useEffect, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import Quagga from "quagga";
import * as R from "ramda";
const Scanner: React.FC<{ onDetect(result: any): void }> = props => {
  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          constraints: {
            facingMode: "environment"
          },
          singleChannel: true, // true: only the red color-channel is read,
          target: document.querySelector("#yourElement") // Or '#yourElement' (optional)
        },
        locator: {
          patchSize: "small",
          halfSample: false
        },
        numOfWorkers: 0,
        decoder: {
          readers: ["ean_reader"]
        },
        locate: true,
        src: null,
        multiple: true
      },
      function(err: any) {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Initialization finished. Ready to start");
        console.log(Quagga);
        Quagga.onDetected((result: any) => {
          const errors: number[] = result.codeResult.decodedCodes
            .filter((_: { error: undefined }) => _.error !== undefined)
            .map((_: { error: any }) => _.error);
          function _getMedian(arr: number[]): number {
            arr.sort((a, b) => a - b);
            const half = Math.floor(arr.length / 2);
            if (arr.length % 2 === 1)
              // Odd length
              return arr[half];
            return (arr[half - 1] + arr[half]) / 2.0;
          }
          function total(arr: number[]) {
            return arr.reduce(
              (previousValue, currentValue) => previousValue + currentValue,
              0
            );
          }
          console.log(
            result.codeResult.code,
            result.codeResult.startInfo.error.toPrecision(2),
            R.mean(errors.map(x=>x+1).map(x=>x*x)).toPrecision(2),
            R.median(errors).toPrecision(2),
            R.reduce<number, number>(R.max, 0, errors).toPrecision(2),
            R.sum(errors.map(x=>x+1).map(x=>x*x)).toPrecision(2)
          );

          props.onDetect(result);
        });
        Quagga.onProcessed((result: any) => {
          // console.log(e);
          var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

          if (result) {
            drawingCtx.clearRect(
              0,
              0,
              parseInt(drawingCanvas.getAttribute("width")),
              parseInt(drawingCanvas.getAttribute("height"))
            );
            if (result.boxes) {
              result.boxes
                .filter(function(box: any) {
                  return box !== result.box;
                })
                .forEach(function(box: any) {
                  Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                    color: "green",
                    lineWidth: 2
                  });
                });
            }
            if (result.box) {
              Quagga.ImageDebug.drawPath(
                result.box,
                { x: 0, y: 1 },
                drawingCtx,
                { color: "#00F", lineWidth: 2 }
              );
            }
            if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(
                result.line,
                { x: "x", y: "y" },
                drawingCtx,
                { color: "red", lineWidth: 3 }
              );
            }
          }
        });
        Quagga.start();

        console.log("asdf");
      }
    );
    return () => {
      Quagga.stop();
    };
  }, []);
  return <div id="yourElement" />;
};

export default Scanner;

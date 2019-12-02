import React, { useEffect, useRef, useState } from "react";

const mapRange = (
  in_min: number,
  in_max: number | undefined,
  out_min: number,
  out_max: number,
  value: number | undefined
) => {
  return in_max != undefined && value != undefined
    ? ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    : undefined;
};

export function ScrollTestPage() {
  const [openPercent, set_openPercent] = useState<number>(1);
  const ref = useRef<HTMLDivElement>(null);
  const initPos = useRef<number | undefined>(undefined);
  let mapRange1 = () =>
    mapRange(
      8,
      initPos.current,
      0,
      1,
      ref.current?.getBoundingClientRect().top
    ) ?? 1;
  useEffect(() => {
    initPos.current = ref.current?.getBoundingClientRect().top;
    set_openPercent(mapRange1());
  }, []);
  return (
    <div
      className="App"
      onScroll={() => {
        set_openPercent(mapRange1());
      }}
    >
      <div
        className="Items"
        style={{
          opacity: mapRange(0, 1, 0.7, 1, openPercent),
          transformOrigin: "50% 150px",
          transform: `scale(${mapRange(0, 1, 0.97, 1, openPercent)})`
        }}
      >
        <div className="Header-Row">Items</div>
      </div>
      <div className="Settings" ref={ref}>
        <div className="Header-Row">Settings</div>
      </div>
    </div>
  );
}

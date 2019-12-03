import React from "react";
import {useSet} from "react-use";
import Scanner from "./Scanner";

type ScannerPageProps = {};
export const ScannerPage: React.FC<ScannerPageProps> = () => {
  const [state, {add}] = useSet<string>();
  return (<div>
      <Scanner
        onDetect={e => {
          add(e.codeResult.code);
        }}
      />
      <div style={{position: "absolute"}}>
        {Array.from(state).map(x => (<div>{x}</div>))}
      </div>
    </div>);
};
import React from "react";
import "./App.css";
import { mount, route } from "navi";
import { Router, View } from "react-navi";
import HelmetProvider from "react-navi-helmet";
import { ScrollTestPage } from "./pages/ScrollTest";
import Scanner from "./Scanner";
import { useSet } from "react-use";

type ScannerPageProps = {};
const ScannerPage: React.FC<ScannerPageProps> = () => {
  const [state, { add }] = useSet<string>();
  return (
    <div>
      <Scanner
        onDetect={e => {
          add(e.codeResult.code);
        }}
      />
      <div style={{ position: "absolute" }}>
        {Array.from(state).map(x => (
          <div>{x}</div>
        ))}
      </div>
    </div>
  );
};

const routes = mount({
  "/": route({
    title: "My Shop",
    view: <ScrollTestPage />
  }),
  scan: route({
    title: "Scanner",
    view: <ScannerPage />
  })
});

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router routes={routes}>
        <View />
      </Router>
    </HelmetProvider>
  );
};

export default App;

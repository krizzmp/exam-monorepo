import React from "react";
import "./App.css";
import {mount, route} from "navi";
import {Router, View} from "react-navi";
import HelmetProvider from "react-navi-helmet";
import {ScrollTestPage} from "./pages/ScrollTest";
import {ScannerPage} from "./pages/Scanner";

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

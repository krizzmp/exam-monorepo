import React from "react";
import "./App.css";
import { mount, route } from "navi";
import { Router, View } from "react-navi";
import HelmetProvider from "react-navi-helmet";
import { ScrollTestPage } from "./pages/ScrollTest";
import { ScannerPage } from "./pages/Scanner";
import AddProductPage from "./pages/AddProduct";

import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
});
const routes = mount({
  "/": route({
    title: "My Shop",
    view: <ScrollTestPage />
  }),
  "/scan": route({
    title: "Scanner",
    view: <ScannerPage />
  }),
  "/add-product": route({
    title: "add product",
    view: <AddProductPage />
  })
});

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ApolloProvider client={client}>
        <Router routes={routes}>
          <View />
        </Router>
      </ApolloProvider>
    </HelmetProvider>
  );
};

export default App;

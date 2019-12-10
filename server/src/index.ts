import { apolloServer as apolloServerPromise } from "./createApolloServer";
import express from "express";
import { createConnection } from "typeorm";
import { LineItem, Product } from "./entities";

(async function() {
  const app = express();
  const path = "/graphql";
  await createConnection({
    type: "sqljs",
    entities: [LineItem, Product],
    synchronize: true
  });
  const apolloServer = await apolloServerPromise;
  apolloServer.applyMiddleware({ app, path });

  app.listen({ port: 4000 }, () =>
    console.log(
      `🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`
    )
  );
})();

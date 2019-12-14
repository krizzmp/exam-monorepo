import { apolloServer as apolloServerPromise } from "./createApolloServer";
import express from "express";
import { createConnection } from "typeorm";
import * as entities from "./entities";

(async function() {
  const app = express();
  const path = "/graphql";
  await createConnection({
    type: "sqljs",
    entities: Object.values(entities),
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

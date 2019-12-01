import {apolloServer as apolloServerPromise} from "./createApolloServer";
import express from "express";

(async function(){
  const app = express();
  const path = '/graphql';

  const apolloServer = await apolloServerPromise;
  apolloServer.applyMiddleware({ app,path });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`)
  );

})();
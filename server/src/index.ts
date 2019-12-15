import { createConnection } from "typeorm";
import * as entities from "./entities";
import {ApolloServer} from "apollo-server";
import {buildSchema} from "type-graphql";
import {RootResolver} from "./resolvers";

(async function() {
  await createConnection({
    type: "postgres",
    url: "postgresql://localhost:5432/exam_test",
    dropSchema: true,
    entities: Object.values(entities),
    synchronize: true,
    logging: false
  });
  // const apolloServer = await apolloServerPromise;
  const server = new ApolloServer({
    schema:await buildSchema({
      resolvers: [RootResolver],
    }),
    playground: true,
    // you can pass the endpoint path for subscriptions
    // otherwise it will be the same as main graphql endpoint
    // subscriptions: "/subscriptions",
  });
  // apolloServer.applyMiddleware({ app, path });

  let serverInfo = await server.listen({port: 4000});
  console.log(`🚀 Server ready at ${serverInfo.url}`);
})();

import { createConnection } from "typeorm";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import * as path from "path";
import { LineItem, Product } from "./entities";
import { RootResolver } from "./resolvers";

export async function createApolloServer() {
  let connection = await createConnection({
    type: "sqljs",
    entities: [LineItem, Product],
    synchronize: true
  });
  return new ApolloServer({
    schema: await buildSchema({
      emitSchemaFile: {
        path: path.resolve(__dirname, "../schema.graphql")
      },
      resolvers: [RootResolver]
    }),
    context: ({ req, res }) => ({ req, res, connection })
  });
}

export const apolloServer = createApolloServer();

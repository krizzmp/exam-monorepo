import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import * as path from "path";
import { RootResolver } from "./resolvers";

export async function createApolloServer() {
  return new ApolloServer({
    schema: await buildSchema({
      emitSchemaFile: {
        path: path.resolve(__dirname, "../schema.graphql")
      },
      resolvers: [RootResolver]
    }),
    context: ({ req, res }) => ({ req, res })
  });
}

export const apolloServer = createApolloServer();

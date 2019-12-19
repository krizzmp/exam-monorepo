import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import * as path from "path";
import { RootResolver } from "./resolvers";
import { Container } from "typedi";

export async function createApolloServer(): Promise<any> {
  return new ApolloServer({
    schema: await buildSchema({
      emitSchemaFile: {
        path: path.resolve(__dirname, "../schema.graphql")
      },
      resolvers: [RootResolver],
      container: Container
    })
  });
}

export const apolloServer = createApolloServer();

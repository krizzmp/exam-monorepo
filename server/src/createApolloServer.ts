// import {createConnection} from "typeorm";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema, Field, ObjectType } from "type-graphql";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import * as path from "path";
@ObjectType()
export class LineItem {
  @Field()
  id: string = "hello";
}
@Resolver()
export class LineItemResolver {
  @Query(() => [LineItem]) lineItems() {
    return [new LineItem()];
  }
  @Query(() => LineItem) lineItem(@Arg("id") id: string) {
    return new LineItem();
  }
  @Mutation()
  scanLineItem(@Arg("itemId") itemId: string): boolean {
    return true;
  }
}
export async function createApolloServer() {
  // await createConnection();

  return new ApolloServer({
    schema: await buildSchema({
      emitSchemaFile: {
        path: path.resolve(__dirname, "../", "schema.graphql")
      },
      resolvers: [LineItemResolver]
    }),
    context: ({ req, res }) => ({ req, res })
  });
}
export const apolloServer = createApolloServer();

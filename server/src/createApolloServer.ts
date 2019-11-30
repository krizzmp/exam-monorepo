import {
  createConnection,
  Entity,
  getRepository,
  PrimaryColumn
} from "typeorm";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema, Field, ObjectType } from "type-graphql";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import * as path from "path";

@ObjectType()
@Entity()
export class LineItem {
  @Field()
  @PrimaryColumn()
  id: string = "hello";
}

export async function createApolloServer() {
  await createConnection({
    type: "sqljs",
    entities: [LineItem],
    synchronize: true
  });

  @Resolver()
  class LineItemResolver {
    repository = getRepository(LineItem);
    @Query(() => [LineItem]) lineItems() {
      return this.repository.find();
    }
    @Query(() => LineItem) lineItem(@Arg("id") id: string) {
      return this.repository.findOne(id);
    }
    @Mutation()
    scanLineItem(@Arg("itemId") itemId: string): boolean {
      const t = new LineItem();
      t.id = itemId;
      this.repository.save(t);
      return true;
    }
  }

  return new ApolloServer({
    schema: await buildSchema({
      emitSchemaFile: {
        path: path.resolve(__dirname, "../schema.graphql")
      },
      resolvers: [LineItemResolver]
    }),
    context: ({ req, res }) => ({ req, res })
  });
}

export const apolloServer = createApolloServer();

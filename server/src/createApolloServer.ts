import {
  Column,
  createConnection,
  Entity,
  getRepository,
  ManyToOne,
  OneToMany,
  PrimaryColumn
} from "typeorm";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import {
  buildSchema,
  Field,
  ObjectType
} from "type-graphql";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import * as path from "path";
type Lazy<T extends object> = Promise<T> | T;
@ObjectType()
@Entity()
export class Product {
  @Field()
  @PrimaryColumn()
  id: string = "hello";
  @Field()
  @Column()
  name: string;
  @Field()
  @Column("int")
  price: number;

  @Field(() => [LineItem])
  @OneToMany(
    () => LineItem,
    lineItem => lineItem.product,
    { lazy: true }
  )
  lineItems: Lazy<LineItem[]>;
}

@ObjectType()
@Entity()
export class LineItem {
  @Field()
  @PrimaryColumn()
  id: string = "hello";
  @Field(()=>Product)
  @ManyToOne(
    () => Product,
    product => product.lineItems,
    { lazy: true }
  )
  product: Lazy<Product>;
}

@Resolver()
class RootResolver {
  repository = getRepository(LineItem);
  @Query(() => [LineItem]) lineItems() {
    return this.repository.find();
  }
  @Query(() => LineItem) lineItem(@Arg("id") id: string) {
    return this.repository.findOne(id);
  }
  @Mutation(() => Boolean)
  async scanLineItem(@Arg("itemId") itemId: string): Promise<boolean> {
    let productRepo = getRepository(Product);
    let product = new Product();
    product.id = "123";
    product.name = "hello";
    product.price = 3099;
    await productRepo.save(product);
    const t = new LineItem();
    t.id = itemId;
    t.product = product;
    await this.repository.save(t);
    return true;
  }
}
export async function createApolloServer() {
  await createConnection({
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
    context: ({ req, res }) => ({ req, res })
  });
}

export const apolloServer = createApolloServer();

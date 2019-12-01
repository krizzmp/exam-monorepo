import {
  Column,
  createConnection,
  Entity,
  getRepository,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema, Field, ObjectType } from "type-graphql";
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
  @PrimaryGeneratedColumn()
  id: string;
  @Field(() => Product)
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
  @Mutation(() => LineItem)
  async scanLineItem(@Arg("itemId") itemId: string): Promise<LineItem> {
    let productRepo = getRepository(Product);
    let product = await productRepo.findOneOrFail(itemId);
    const t = new LineItem();
    t.product = product;
    return this.repository.save(t);
  }
  @Mutation(() => Product)
  async createProduct(@Arg("itemId") itemId: string): Promise<Product> {
    let productRepo = getRepository(Product);
    let product = new Product();
    product.id = itemId;
    product.name = "hello";
    product.price = 3099;
    return await productRepo.save(product);
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

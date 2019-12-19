import {
  Arg,
  Field,
  Int,
  Mutation,
  ObjectType,
  Publisher,
  PubSub,
  Query,
  Resolver,
  Subscription
} from "type-graphql";
import { Cart, LineItem, Product, Store } from "./entities";
import { getRepo } from "./__tests/helpers";

@ObjectType()
class Notification {
  @Field()
  name: string;
}

@Resolver()
export class RootResolver {
  @Query(() => [LineItem])
  lineItems() {
    return getRepo(LineItem).find();
  }
  @Query(() => [Product])
  async products(): Promise<Product[]> {
    return await getRepo(Product).find();
  }

  @Query(() => LineItem)
  lineItem(@Arg("id", () => Int) id: number) {
    return getRepo(LineItem).findOne(id);
  }

  @Mutation(() => LineItem)
  async scanLineItem(
    @Arg("productId") productId: string,
    @Arg("cartId", () => Int) cartId: number
  ): Promise<LineItem> {
    let product = await getRepo(Product).findOneOrFail(productId);
    let lineItem = getRepo(LineItem).create({ product });
    return getRepo(LineItem).save(lineItem);
  }
  @Mutation(() => Store)
  async createStore(@Arg("name") name: string): Promise<Store> {
    let lineItem = getRepo(Store).create({ name });
    return getRepo(Store).save(lineItem);
  }
  @Mutation(() => Cart)
  async createCart(@Arg("storeId", () => Int) storeId: number): Promise<Cart> {
    let store = await getRepo(Store).findOneOrFail(storeId);
    let cart = getRepo(Cart).create({ store });
    return getRepo(Cart).save(cart);
  }

  @Mutation(() => Product)
  async createProduct(
    @Arg("id") id: string,
    @Arg("name") name: string,
    @Arg("price", () => Int) price: number,
    @PubSub("NOTIFICATIONS") publish: Publisher<Notification>
  ): Promise<Product> {
    let product = getRepo(Product).create({
      id,
      name,
      price
    });
    await publish({ name: "4321" });
    return await getRepo(Product).save(product);
  }
  @Subscription({
    topics: "NOTIFICATIONS" // single topic
  })
  test(): Notification {
    let notification = new Notification();
    notification.name = "asdf";
    return notification;
  }
}

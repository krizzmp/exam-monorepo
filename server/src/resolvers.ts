import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Cart, LineItem, Product, Store } from "./entities";

@Resolver()
export class RootResolver {
  @Query(() => [LineItem])
  lineItems() {
    return getRepository(LineItem).find();
  }
  @Query(() => [Product])
  products() {
    return getRepository(Product).find();
  }

  @Query(() => LineItem)
  lineItem(@Arg("id") id: string) {
    return getRepository(LineItem).findOne(id);
  }

  @Mutation(() => LineItem)
  async scanLineItem(@Arg("productId") productId: string): Promise<LineItem> {
    let productRepo = getRepository(Product);
    let product = await productRepo.findOneOrFail(productId);
    let lineItemRepository = getRepository(LineItem);
    let lineItem = lineItemRepository.create({ product });
    return lineItemRepository.save(lineItem);
  }
  @Mutation(() => Store)
  async createStore(@Arg("name") name: string): Promise<Store> {
    let storeRepo = getRepository(Store);
    let lineItem = storeRepo.create({ name });
    return storeRepo.save(lineItem);
  }
  @Mutation(() => Cart)
  async createCart(@Arg("storeId") storeId: string): Promise<Cart> {
    let cartRepository = getRepository(Cart);
    let storeRepository = getRepository(Store);
    let store = await storeRepository.findOneOrFail(storeId);
    let cart = cartRepository.create({ store });
    return cartRepository.save(cart);
  }

  @Mutation(() => Product)
  async createProduct(
    @Arg("id") id: string,
    @Arg("name") name: string,
    @Arg("price", () => Int) price: number
  ): Promise<Product> {
    let productRepo = getRepository(Product);
    let product = productRepo.create({
      id,
      name,
      price
    });
    return await productRepo.save(product);
  }
}

import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { LineItem, Product } from "./entities";

@Resolver()
export class RootResolver {
  @Query(() => [LineItem])
  lineItems() {
    return getRepository(LineItem).find();
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

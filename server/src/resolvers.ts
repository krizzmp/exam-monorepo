import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { LineItem, Product } from "./entities";

@Resolver()
export class RootResolver {
  repository = getRepository(LineItem);

  @Query(() => [LineItem])
  lineItems() {
    return this.repository.find();
  }

  @Query(() => LineItem)
  lineItem(@Arg("id") id: string) {
    return this.repository.findOne(id);
  }

  @Mutation(() => LineItem)
  async scanLineItem(@Arg("itemId") itemId: string): Promise<LineItem> {
    let productRepo = getRepository(Product);
    let product = await productRepo.findOneOrFail(itemId);
    let lineItemRepository = getRepository(LineItem);
    let lineItem = lineItemRepository.create({ product });
    return lineItemRepository.save(lineItem);
  }

  @Mutation(() => Product)
  async createProduct(
    @Arg("itemId") id: string,
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

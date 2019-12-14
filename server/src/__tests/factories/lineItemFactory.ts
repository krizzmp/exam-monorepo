import { ProductFactory } from "./productFactory";
import { getRepository } from "typeorm";
import { LineItem } from "../../entities";

export async function LineItemFactory(id = 1) {
  const product = {
    id: id,
    product: await ProductFactory()
  };
  let repository = getRepository(LineItem);
  let product1 = repository.create(product);
  return repository.save(product1);
}

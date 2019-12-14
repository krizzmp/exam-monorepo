import {Product} from "../../entities";
import {getRepository} from "typeorm";

export function ProductFactory(product: Partial<Product> = {
  id: "1234567890123", name: "testy lemon", price: 20_00,
}) {
  let repository = getRepository(Product);
  let product1 = repository.create(product);
  return repository.save(product1);
}
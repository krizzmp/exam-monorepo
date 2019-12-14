import { Cart, Product, Store } from "../../entities";
import { getRepository } from "typeorm";

export function ProductFactory(
  product: Partial<Product> = {
    id: "1234567890123",
    name: "testy lemon",
    price: 20_00
  }
) {
  let repository = getRepository(Product);
  let product1 = repository.create(product);
  return repository.save(product1);
}
export async function CartFactory() {
  let cartRepository = getRepository(Cart);
  let storeRepository = getRepository(Store);

  let store_ = storeRepository.create({ name: "asd" });
  let store = await storeRepository.save(store_);
  let carts = cartRepository.create({ store });
  return cartRepository.save(carts);
}

import { Cart, Product, Store } from "../../entities";
import { getRepo } from "../helpers";

export async function ProductFactory(
  product: Partial<Product> = {
    id: "1234567890123",
    name: "testy lemon",
    price: 20_00
  }
) {
  let productRepository = getRepo(Product);
  let product1 = productRepository.create(product);
  return await productRepository.save(product1);
}
export async function CartFactory() {
  let cartRepository = getRepo(Cart);
  let storeRepository = getRepo(Store);

  let store_ = storeRepository.create({ name: "asd" });
  let store = await storeRepository.save(store_);
  let carts = cartRepository.create({ store });
  return cartRepository.save(carts);
}

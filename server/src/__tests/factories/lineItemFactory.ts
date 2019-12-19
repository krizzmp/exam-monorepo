import { ProductFactory } from "./productFactory";
import { LineItem } from "../../entities";
import { getRepo } from "../helpers";

export async function LineItemFactory() {
  const lineItemBase = {
    product: await ProductFactory()
  };
  let lineItemRepository = getRepo(LineItem);
  let lineItem = lineItemRepository.create(lineItemBase);
  return lineItemRepository.save(lineItem);
}

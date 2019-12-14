import {
  closeTestConnection,
  createTestConnection
} from "./factories/testConnectionFactory";
import { createTestClient } from "apollo-server-testing";
import { apolloServer } from "../createApolloServer";
import { gql } from "apollo-server-express";
import { ProductFactory } from "./factories/productFactory";

beforeEach(createTestConnection);
afterEach(closeTestConnection);
describe("scan and pay", function() {
  it("should Price", async function() {
    const { mutate } = createTestClient(await apolloServer);

    async function createStore() {
      const response = await mutate({
        mutation: gql`
          mutation($name: String!) {
            createStore(name: $name) {
              id
            }
          }
        `,
        variables: { name: "store no 1" }
      });
      expect(response.errors).toBeUndefined();
      expect(response.data.createStore.id).toBe(1);
      return response.data.createStore.id;
    }
    const storeId = await createStore();

    async function createCart() {
      const response = await mutate({
        mutation: gql`
          mutation($storeId: Int!) {
            createCart(storeId: $storeId) {
              id
            }
          }
        `,
        variables: { storeId }
      });
      expect(response.errors).toBeUndefined();
      expect(response.data.createCart.id).toBe(1);
      return response.data.createCart.id;
    }
    const cartId = await createCart();
    let product = await ProductFactory();
    async function scanItem() {
      const response = await mutate({
        mutation: gql`
          mutation($productId: String!, $cartId: Int!) {
            scanLineItem(productId: $productId, cartId: $cartId) {
              id
            }
          }
        `,
        variables: { cartId, productId: product.id }
      });
      expect(response.errors).toBeUndefined();
      expect(response.data.scanLineItem.id).toBe(1);
      return response.data.scanLineItem.id;
    }
    const lineItemId = await scanItem();
  });
});

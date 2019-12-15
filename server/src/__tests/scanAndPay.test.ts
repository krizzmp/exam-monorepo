import { createTestClient } from "apollo-server-testing";
import { apolloServer } from "../createApolloServer";
import { gql } from "apollo-server-express";
import { ProductFactory } from "./factories/productFactory";
import {db_it} from "./helpers";
describe("scan and pay", function() {
  db_it("should Price", async function() {
    console.log("start test");
    let server = await apolloServer;
    const { mutate } = createTestClient(server);

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

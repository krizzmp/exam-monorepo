import { createTestClient } from "apollo-server-testing";
import { apolloServer } from "../createApolloServer";
import { gql } from "apollo-server-express";
import { ProductFactory } from "./factories/productFactory";
import { withDb, withMigrations } from "./helpers";

describe(
  "Scan and pay",
  withDb(
    withMigrations(() => {
      it("should flow", async function() {
        let server = await apolloServer;
        const { mutate } = createTestClient(server as any);

        async function createStore() {
          const response = await mutate({
            mutation: gql`
              mutation($name: String!) {
                createStore(name: $name) {
                  id
                  name
                }
              }
            `,
            variables: { name: "store no 1" }
          });
          expect(response.errors).toBeUndefined();
          expect(response.data.createStore.id).not.toBeUndefined();
          expect(response.data.createStore.name).toEqual("store no 1");
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
          expect(response.data.createCart.id).not.toBeUndefined();
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
          expect(response.data.scanLineItem.id).not.toBeUndefined();
          return response.data.scanLineItem.id;
        }
        await scanItem();
      });
    })
  )
);

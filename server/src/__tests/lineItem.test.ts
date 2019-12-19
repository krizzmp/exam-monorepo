import { CartFactory, ProductFactory } from "./factories/productFactory";
import { createTestClient } from "apollo-server-testing";
import { apolloServer } from "../createApolloServer";
import { gql } from "apollo-server-express";
import { LineItemFactory } from "./factories/lineItemFactory";
import { withDb, withMigrations } from "./helpers";

describe(
  "lineItem",
  withDb(
    withMigrations(() => {
      it("should scan LineItem", async function() {
        let product = await ProductFactory();
        let cart = await CartFactory();
        const { mutate } = createTestClient(await apolloServer);
        const response = await mutate({
          mutation: gql`
            mutation s1($productId: String!, $cartId: Int!) {
              s1: scanLineItem(productId: $productId, cartId: $cartId) {
                id
              }
              s2: scanLineItem(productId: $productId, cartId: $cartId) {
                id
              }
            }
          `,
          variables: { productId: product.id, cartId: cart.id }
        });
        expect(response.errors).toBeUndefined();
        expect(response.data.s1.id).not.toBeUndefined();
        expect(response.data.s2.id).not.toBeUndefined();
        expect(response.data.s1.id).not.toEqual(response.data.s2.id);
      });
      it("should query LineItems", async function() {
        await LineItemFactory();
        await LineItemFactory();
        const { query } = createTestClient(await apolloServer);
        const response = await query({
          query: gql`
            query {
              lineItems {
                id
              }
            }
          `
        });
        expect(response.errors).toBeUndefined();
        expect(response.data.lineItems).toHaveLength(2);
      });
      it("should query LineItem", async function() {
        const {id} = await LineItemFactory();
        const { query } = createTestClient(await apolloServer);
        const response = await query({
          query: gql`
            query($id: Int!) {
              lineItem(id: $id) {
                id
                product {
                  name
                }
              }
            }
          `,
          variables: { id }
        });
        expect(response.errors).toBeUndefined();
        expect(response.data.lineItem).toEqual({
          id,
          product: { name: "testy lemon" }
        });
      });
    })
  )
);

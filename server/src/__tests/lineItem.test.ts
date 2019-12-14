import {
  closeTestConnection,
  createTestConnection
} from "./factories/testConnectionFactory";
import { ProductFactory } from "./factories/productFactory";
import { createTestClient } from "apollo-server-testing";
import { apolloServer } from "../createApolloServer";
import { gql } from "apollo-server-express";
import { LineItemFactory } from "./factories/lineItemFactory";

describe("lineItem", function() {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);
  it("should scan LineItem", async function() {
    await ProductFactory();
    const { mutate } = createTestClient(await apolloServer);
    const response = await mutate({
      mutation: gql`
        mutation s1($productId: String!) {
          s1: scanLineItem(productId: $productId) {
            id
          }
          s2: scanLineItem(productId: $productId) {
            id
          }
        }
      `,
      variables: { productId: "1234567890123", productId2: "1234567890123" }
    });
    expect(response.errors).toBeUndefined();
    expect(response.data.s1.id).toBe("1");
    expect(response.data.s2.id).toBe("2");
  });
  it("should query LineItems", async function() {
    await LineItemFactory("1");
    await LineItemFactory("2");
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
    expect(response.data.lineItems).toContainEqual({ id: "1" });
    expect(response.data.lineItems).toContainEqual({ id: "2" });
    expect(response.data.lineItems).toHaveLength(2);
  });
  it("should query LineItem", async function() {
    await LineItemFactory("1");
    const { query } = createTestClient(await apolloServer);
    const response = await query({
      query: gql`
        query($id: String!) {
          lineItem(id: $id) {
            id
            product {
              name
            }
          }
        }
      `,
      variables: { id: "1" }
    });
    expect(response.errors).toBeUndefined();
    expect(response.data.lineItem).toEqual({
      id: "1",
      product: { name: "testy lemon" }
    });
  });
});

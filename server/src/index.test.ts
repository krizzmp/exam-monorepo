import { apolloServer } from "./createApolloServer";
import { gql } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";

it("should create product", async function() {
  const { mutate } = createTestClient(await apolloServer);
  const response = await mutate({
    mutation: gql`
      mutation($itemId: String!, $name: String!, $price: Int!) {
        createProduct(itemId: $itemId, name: $name, price: $price) {
          id
        }
      }
    `,
    variables: { itemId: "1234", name: "test", price: 300_00 }
  });
  expect(response.errors).toBeUndefined();
  expect(response.data.createProduct.id).toBe("1234");
});
it("should scan LineItem", async function() {
  const { mutate } = createTestClient(await apolloServer);
  const response = await mutate({
    mutation: gql`
      mutation s1($itemId: String!, $itemId2: String!) {
        s1: scanLineItem(itemId: $itemId) {
          id
        }
        s2: scanLineItem(itemId: $itemId2) {
          id
        }
      }
    `,
    variables: { itemId: "1234", itemId2: "1234" }
  });
  expect(response.errors).toBeUndefined();
  expect(response.data.s1.id).toBe("1");
  expect(response.data.s2.id).toBe("2");
});

it("should query LineItems", async function() {
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
  const { query } = createTestClient(await apolloServer);
  const response = await query({
    query: gql`
      query($itemId: String!) {
        lineItem(id: $itemId) {
          id
          product {
            name
          }
        }
      }
    `,
    variables: { itemId: "1" }
  });
  expect(response.errors).toBeUndefined();
  expect(response.data.lineItem).toEqual({
    id: "1",
    product: { name: "test" }
  });
});

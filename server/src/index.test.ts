import { apolloServer } from "./createApolloServer";
import { gql } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";

it("should scan LineItem", async function() {
  const { mutate } = createTestClient(await apolloServer);
  const response = await mutate({
    mutation: gql`
      mutation s1($itemId: String!, $itemId2: String!) {
        s1: scanLineItem(itemId: $itemId)
        s2: scanLineItem(itemId: $itemId2)
      }
    `,
    variables: { itemId: "1234", itemId2: "12345" }
  });
  expect(response.errors).toBeUndefined();
  expect(response.data.s1).toBe(true);
  expect(response.data.s2).toBe(true);
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
  expect(response.data.lineItems).toContainEqual({ id: "1234" });
  expect(response.data.lineItems).toContainEqual({ id: "12345" });
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
    variables: { itemId: "1234" }
  });
  expect(response.errors).toBeUndefined();
  expect(response.data.lineItem).toEqual({
    id: "1234",
    product: { name: "hello" }
  });
});

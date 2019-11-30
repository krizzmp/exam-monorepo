import { apolloServer, LineItem } from "./createApolloServer";
import { gql } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";

it("should scan LineItem", async function() {
  const { mutate } = createTestClient(await apolloServer);
  const response = await mutate({
    mutation: gql`
      mutation($itemId: String!) {
        scanLineItem(itemId: $itemId)
      }
    `,
    variables: { itemId: "string" }
  });
  expect(response.data.scanLineItem).toBe(true);
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
  expect(response.data.lineItems).toContainEqual<LineItem>({ id: "string" });
});
it("should query LineItem", async function() {
  const { query } = createTestClient(await apolloServer);
  const response = await query({
    query: gql`
      query($itemId: String!) {
        lineItem(id: $itemId) {
          id
        }
      }
    `,
    variables: { itemId: "string" }
  });
  expect(response.data.lineItem).toEqual<LineItem>({ id: "string" });
});

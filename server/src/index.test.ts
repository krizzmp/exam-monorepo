import { apolloServer } from "./createApolloServer";
import { gql } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";

it("should create product", async function() {
  const { mutate } = createTestClient(await apolloServer);
  const response = await mutate({
    mutation: gql`
      mutation($id: String!, $name: String!, $price: Int!) {
        createProduct(id: $id, name: $name, price: $price) {
          id
        }
      }
    `,
    variables: { id: "1234", name: "test", price: 300_00 }
  });
  expect(response.errors).toBeUndefined();
  expect(response.data.createProduct.id).toBe("1234");
});
it("should scan LineItem", async function() {
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
    variables: { productId: "1234", productId2: "1234" }
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
    product: { name: "test" }
  });
});

it("should query Products", async function() {
  const { query } = createTestClient(await apolloServer);
  const response = await query({
    query: gql`
      query {
        products {
          id
          name
          price
        }
      }
    `
  });
  expect(response.errors).toBeUndefined();
  expect(response.data.products).toContainEqual({
    id: "1234",
    name: "test",
    price: 300_00
  });
});

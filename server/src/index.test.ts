import { apolloServer } from "./createApolloServer";
import { gql } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";
import { createConnection, getConnection, getRepository } from "typeorm";
import { LineItem, Product } from "./entities";
beforeEach(() => {
  return createConnection({
    type: "sqljs",
    dropSchema: true,
    entities: [LineItem, Product],
    synchronize: true,
    logging: false
  });
});

afterEach(() => {
  let conn = getConnection();
  return conn.close();
});
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
function ProductFactory(
  product: Partial<Product> = {
    id: "1234567890123",
    name: "testy lemon",
    price: 20_00
  }
) {
  let repository = getRepository(Product);
  let product1 = repository.create(product);
  return repository.save(product1);
}
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
async function LineItemFactory(id = "1") {
  const product = {
    id: id,
    product: await ProductFactory()
  };
  let repository = getRepository(LineItem);
  let product1 = repository.create(product);
  return repository.save(product1);
}
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

it("should query Products", async function() {
  await ProductFactory();
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
    id: "1234567890123",
    name: "testy lemon",
    price: 20_00
  });
});

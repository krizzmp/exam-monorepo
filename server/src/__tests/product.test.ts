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
describe("product", function() {
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
});

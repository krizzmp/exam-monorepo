import {
  closeTestConnection,
  createTestConnection
} from "./factories/testConnectionFactory";
import { createTestClient } from "apollo-server-testing";
import { apolloServer } from "../createApolloServer";
import { gql } from "apollo-server-express";

beforeEach(createTestConnection);
afterEach(closeTestConnection);
describe("scan and pay", function() {
  it("should Price", async function() {
    const { mutate } = createTestClient(await apolloServer);
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
    expect(response.data.createStore.id).toBe("1");
    const response2 = await mutate({
      mutation: gql`
        mutation($storeId: String!) {
          createCart(storeId: $storeId) {
            id
          }
        }
      `,
      variables: { storeId: response.data.createStore.id }
    });
    expect(response2.errors).toBeUndefined();
  });
});

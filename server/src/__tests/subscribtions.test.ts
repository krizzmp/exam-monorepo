import {ApolloClient} from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {createHttpLink} from "apollo-link-http";
import fetch from "node-fetch";
import {split} from "apollo-link";
import {getMainDefinition} from "apollo-utilities";
import ws from "ws";
import {gql} from "apollo-server-express";
import {ApolloServer} from "apollo-server";
import {buildSchema} from "type-graphql";
import {RootResolver} from "../resolvers";

import {WebSocketLink} from "apollo-link-ws";
import {SubscriptionClient} from "subscriptions-transport-ws";
import {db_it} from "./helpers";

const PORT = 4000;
describe("subs", function() {
  db_it("should sub", async function() {
    // Create GraphQL server
    const server = new ApolloServer({
      schema: await buildSchema({
        resolvers: [RootResolver]
      }),
      playground: true
      // you can pass the endpoint path for subscriptions
      // otherwise it will be the same as main graphql endpoint
      // subscriptions: "/subscriptions",
    });

    // Start the server
    const { url, subscriptionsUrl } = await server.listen(PORT);
    const httpLink = createHttpLink({ uri: url, fetch });
    // Create a WebSocket link:
    const wsClient = new SubscriptionClient(
      subscriptionsUrl,
      {
        reconnect: true
      },
      ws
    );

    const wsLink = new WebSocketLink(wsClient);

    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    const link = split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    );
    const client = new ApolloClient({
      link,
      cache: new InMemoryCache()
    });
    let resp = await client.query({
      query: gql`
        query {
          products {
            id
          }
        }
      `
    });
    expect(resp.errors).toBeUndefined();
    const resp_ = client.subscribe({
      query: gql`
        subscription {
          test {
            name
          }
        }
      `
    });
    expect.assertions(2);
    let promise = new Promise((done)=>resp_.subscribe({
      next(value: any): void {
        expect(value.data.test.name).toBe("asdf");
        done();
      },
      error(errorValue: any): void {
        console.log(errorValue);
        done();
      }
    }));
    await client.mutate({
      mutation: gql`
        mutation {
          createProduct(id: "1234", name: "fdsa", price: 3) {
            id
          }
        }
      `
    });
    await promise
  });

});

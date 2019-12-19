import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import fetch from "node-fetch";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
import ws from "ws";
import { gql } from "apollo-server-express";

import { WebSocketLink } from "apollo-link-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { withDb, withMigrations } from "./helpers";
import { createApolloServer } from "../createApolloServer";
import { ApolloServer } from "apollo-server";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
const PORT = 4000;

describe(
  "subs",
  withDb(
    withMigrations(() => {
      it("should sub", async function() {
        let client: ApolloClient<any>;
        let wsClient: SubscriptionClient;
        let server: ApolloServer;
        try {
          // Create GraphQL server
          server = await createApolloServer();

          // Start the server
          const { url, subscriptionsUrl } = await server.listen(PORT);
          const httpLink = createHttpLink({ uri: url, fetch });
          // // Create a WebSocket link:
          wsClient = new SubscriptionClient(
            subscriptionsUrl,
            {
              reconnect: true
            },
            ws
          );
          //
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
          client = new ApolloClient({
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
          let promise = new Observable<any>(subscriber => {
            let subscription = resp_.subscribe({
              next(value): void {
                subscriber.next(value);
              },
              error(errorValue: any): void {
                subscriber.error(errorValue);
              },
              complete(): void {
                subscriber.complete();
              }
            });
            return () => {
              subscription.unsubscribe();
            };
          })
            .pipe(take(1))
            .toPromise();
          await client.mutate({
            mutation: gql`
              mutation {
                createProduct(id: "1234", name: "fdsa", price: 3) {
                  id
                }
              }
            `
          });
          let eventRes = await promise;
          expect(eventRes.errors).toBeUndefined();
          expect(eventRes.data.test.name).toEqual("asdf");
        } finally {
          wsClient.close();
          client.stop();
          await server.stop();
        }
      });
    })
  )
);

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/core";

// HTTP connection to the Tarkov API
const httpLink = createHttpLink({
  uri: "https://api.tarkov.dev/graphql",
  fetchOptions: {
    timeout: 10000,
  },
});

// Cache implementation with 24-hour cache policy
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        tasks: {
          merge: false, // Replace the array entirely on refetch
        },
        hideoutStations: {
          merge: false,
        },
        maps: {
          merge: false,
        },
        traders: {
          merge: false,
        },
      },
    },
  },
});

// Create the Apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  },
});

export default apolloClient;

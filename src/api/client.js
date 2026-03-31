import { ApolloClient, InMemoryCache, split, HttpLink, ApolloLink, concat } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

// 1. Logic to get the best available headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  // If we have a JWT, use it. This ensures 'x-hasura-school-id' 
  // is passed to your Node.js action correctly.
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  // Fallback to Admin Secret for development/setup only
  return {
    'x-hasura-admin-secret': import.meta.env.VITE_HASURA_ADMIN_SECRET,
  };
};

// 2. Middleware for HTTP (Mutations/Queries)
// This runs BEFORE every request to grab the latest token from localStorage
const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: getAuthHeaders(),
  });
  return forward(operation);
});

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_HASURA_URL,
});

// 3. WebSocket Link (Subscriptions)
// connectionParams as a function ensures it grabs the token when the socket connects
const wsLink = new GraphQLWsLink(createClient({
  url: import.meta.env.VITE_HASURA_URL.replace('http', 'ws'),
  connectionParams: () => ({
    headers: getAuthHeaders(),
  }),
}));

// 4. The Splitter
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  concat(authMiddleware, httpLink), // Apply middleware to HTTP requests
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
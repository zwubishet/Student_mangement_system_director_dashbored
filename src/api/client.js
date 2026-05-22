import { ApolloClient, InMemoryCache, ApolloLink, HttpLink, split, concat } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const hasuraUrl = import.meta.env.VITE_HASURA_URL?.trim();

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const role = localStorage.getItem('role');
  const managingSchoolId = sessionStorage.getItem('managingSchoolId');
  if (role === 'SUPER_ADMIN' && managingSchoolId) {
    headers['X-Tenant-School-Id'] = managingSchoolId;
  }
  if (!token) {
    const secret = import.meta.env.VITE_HASURA_ADMIN_SECRET;
    if (secret) headers['x-hasura-admin-secret'] = secret;
  }
  return headers;
};

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({ headers: getAuthHeaders() });
  return forward(operation);
});

const noopLink = new ApolloLink((operation, forward) => forward(operation));

const buildLink = () => {
  if (!hasuraUrl) {
    return noopLink;
  }

  const httpLink = new HttpLink({ uri: hasuraUrl });
  const httpWithAuth = concat(authMiddleware, httpLink);

  try {
    const wsUrl = hasuraUrl.replace(/^http/, 'ws');
    const wsLink = new GraphQLWsLink(
      createClient({
        url: wsUrl,
        connectionParams: () => ({ headers: getAuthHeaders() }),
      })
    );
    return split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return def.kind === 'OperationDefinition' && def.operation === 'subscription';
      },
      wsLink,
      httpWithAuth
    );
  } catch {
    return httpWithAuth;
  }
};

export const hasGraphql = Boolean(hasuraUrl);

export const client = new ApolloClient({
  link: buildLink(),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
});

import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
const DOMAIN_BASE = import.meta.env.VITE_BACKEND_HTTP_URL_BASE;

const GQL_BASE_URL = `${DOMAIN_BASE}/graphql`;
const fileUploadLink = createUploadLink({
  uri: GQL_BASE_URL,
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: fileUploadLink,
});

import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

const GQL_BASE_URL = 'http://localhost:80/graphql';

const fileUploadLink = createUploadLink({
  uri: GQL_BASE_URL,
  headers: {
    'Content-Type': `application/json`,
    'Accept': `application/json`
  }
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: fileUploadLink,
});

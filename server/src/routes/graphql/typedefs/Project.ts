import gql from 'graphql-tag';

export const typeDefs = gql`
  type Project {
    id: ID!
    name: String!
    description: String!
    sharedWith: [UserSharing]!
    documents: [Document]
  }
`;

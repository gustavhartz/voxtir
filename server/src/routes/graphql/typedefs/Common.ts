import gql from 'graphql-tag';

export const typeDefs = gql`
  type StatusResponse {
    message: String!
  }

  type ActionResult {
    success: Boolean!
    message: String
  }

  type PresignedUrlResponse {
    url: String!
    expiresAtUnixSeconds: Int!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    credits: Int!
  }
  type UserSharing {
    email: String!
    role: Role!
    used: Boolean!
  }
  enum Role {
    ADMIN
    MEMBER
  }
`;

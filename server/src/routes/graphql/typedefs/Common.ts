import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar Upload

  type StatusResponse {
    message: String!
  }

  input DocumentUploadInput {
    docType: String!
    file: Upload!
  }

  type ActionResult {
    success: Boolean!
    message: String
  }

  type PresignedUrlResponse {
    url: String!
    expiresAt: Int!
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }
  type UserSharing {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }
  enum Role {
    ADMIN
    MEMBER
  }
`;

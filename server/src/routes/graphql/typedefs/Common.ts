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

  interface IUser {
    id: ID!
    name: String!
    email: String!
  }

  type User implements IUser {
    id: ID!
    name: String!
    email: String!
  }
  type UserSharing implements IUser {
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

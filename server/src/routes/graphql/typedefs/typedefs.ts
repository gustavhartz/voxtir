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

  type SuccessResult {
    success: Boolean!
    message: String
  }

  type Query {
    status: StatusResponse
  }

  type Mutation {
    uploadDocuments(docs: [DocumentUploadInput!]!): SuccessResult
  }
`;

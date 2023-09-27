import gql from 'graphql-tag';

/* GraphQL */
export const typeDefs = gql`
  type Query {
    status: ActionResult
    me: User
    projects: [Project]
    project(id: ID!): Project
    projectSharedWith(id: ID!): [UserSharing]
    supportedLanguages: [LanguageCodePairs]
    document(id: ID!): Document
    generateWordExport(documentId: ID!): PresignedUrlResponse
    pinnedProjects: [Project]
  }
`;

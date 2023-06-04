import gql from 'graphql-tag';

export const typeDefs = gql`
  type Mutation {
    uploadAudioFile(doc: DocumentUploadInput!, documentId: ID!): ActionResult
    uploadDocuments(docs: [DocumentUploadInput!]!): ActionResult
    """
    Projects
    """
    createProject(name: String!, description: String!): Project!
    deleteProject(id: ID!): ActionResult!
    shareProject(id: ID!, userEmail: String!, role: Role!): ActionResult!
    unshareProject(id: ID!, userEmail: String!): ActionResult!

    """
    Documents
    """
    createDocument(
      title: String!
      description: String
      language: String!
      transcriptionType: TranscriptionType
    ): Document!
    updateDocument(
      documentId: ID!
      title: String
      description: String
    ): ActionResult!
    deleteDocument(documentId: ID!): ActionResult!
    shareDocument(
      documentId: ID!
      userEmail: String!
      role: Role!
    ): ActionResult!
    unshareDocument(documentId: ID!, userEmail: String!): ActionResult!
    trashDocument(documentId: ID!): ActionResult!
  }
`;

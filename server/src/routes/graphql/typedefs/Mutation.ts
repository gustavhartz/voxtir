import gql from 'graphql-tag';

export const typeDefs = gql`
  type Mutation {
    uploadAudioFile(
      doc: DocumentUploadInput!
      documentId: ID!
      projectId: ID!
      contentLength: Int!
    ): ActionResult
    getPresignedUrlForAudioFile(documentId: ID!): PresignedUrlResponse
    """
    Projects
    """
    createProject(name: String!, description: String!): ActionResult!
    deleteProject(id: ID!): ActionResult!
    shareProject(id: ID!, userEmail: String!, role: Role!): ActionResult!
    unshareProject(id: ID!, userEmail: String!): ActionResult!
    updateProject(id: ID!, name: String, description: String): ActionResult!
    acceptProjectInvitation(token: String!): ActionResult!

    """
    Documents
    """
    createDocument(
      projectId: ID!
      title: String!
      language: String
      dialect: String
      speakerCount: Int
      transcriptionType: TranscriptionType!
    ): ID!
    updateDocument(documentId: ID!, title: String!): ActionResult!
    trashDocument(documentId: ID!, projectId: ID!): ActionResult!
    pinnedProject(projectId: ID!, pin: Boolean!): ActionResult!
  }
`;

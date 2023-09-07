import gql from 'graphql-tag';

export const typeDefs = gql`
  type Mutation {
    uploadAudioFile(
      doc: DocumentUploadInput!
      documentId: ID!
      projectId: ID!
      contentLength: Int!
    ): ActionResult
    getPresignedUrlForAudioFile(
      documentId: ID!
      projectId: ID!
    ): PresignedUrlResponse
    """
    Projects
    """
    createProject(name: String!, description: String!): ActionResult!
    deleteProject(id: ID!): ActionResult!
    shareProject(id: ID!, userEmail: String!, role: Role!): ActionResult!
    unshareProject(id: ID!, userEmail: String!): ActionResult!
    updateProject(id: ID!, name: String, description: String): ActionResult!
    acceptProjectInvitation(id: ID!, token: String!): ActionResult!

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
    trashDocument(documentId: ID!, projectId: ID!): ActionResult!
    pinnedProject(projectId: ID!, pin: Boolean!): ActionResult!
  }
`;

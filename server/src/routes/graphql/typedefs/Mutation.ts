import gql from 'graphql-tag';

export const typeDefs = gql`
  type Mutation {
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
      mimeType: String!
    ): PresignedUrlResponse!
    updateDocument(documentId: ID!, title: String!): ActionResult!
    trashDocument(documentId: ID!, projectId: ID!): ActionResult!
    pinnedProject(projectId: ID!, pin: Boolean!): ActionResult!
  }
`;

import gql from 'graphql-tag';

export const typeDefs = gql`
  enum TranscriptionStatus {
    NOT_STARTED
    IN_PROGRESS
    COMPLETED
  }

  enum TranscriptionType {
    AUTOMATIC
    MANUAL
  }

  type Document {
    id: ID!
    title: String!
    projectId: ID!
    sharedWith: [UserSharing]!
    isTrashed: Boolean!
    lastModified: String!
    description: String
    transcriptionMetadata: TranscriptionMetadata
    transcriptionStatus: TranscriptionStatus!
    transcriptionType: TranscriptionType!
  }

  type TranscriptionMetadata {
    speakersCount: Int
    dialects: [String]
    language: String!
  }
`;

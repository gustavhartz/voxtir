import gql from 'graphql-tag';

export const typeDefs = gql`
  enum TranscriptionStatus {
    CREATED
    QUEUED
    PROCESSING
    FAILED
    DONE
  }

  enum TranscriptionType {
    AUTOMATIC
    MANUAL
  }

  type Document {
    id: ID!
    title: String!
    projectId: ID!
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
    language: String
  }

  type LanguageCodePairs {
    languageCode: String
    languageName: String
  }
`;

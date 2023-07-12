import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../context';
import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Upload: { input: any; output: any; }
};

export type ActionResult = {
  __typename?: 'ActionResult';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Document = {
  __typename?: 'Document';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isTrashed: Scalars['Boolean']['output'];
  lastModified: Scalars['String']['output'];
  projectId: Scalars['ID']['output'];
  sharedWith: Array<Maybe<UserSharing>>;
  title: Scalars['String']['output'];
  transcriptionMetadata?: Maybe<TranscriptionMetadata>;
  transcriptionStatus: TranscriptionStatus;
  transcriptionType: TranscriptionType;
};

export type DocumentUploadInput = {
  docType: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
};

export type IUser = {
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Documents */
  createDocument: Document;
  /** Projects */
  createProject: Project;
  deleteDocument: ActionResult;
  deleteProject: ActionResult;
  shareDocument: ActionResult;
  shareProject: ActionResult;
  trashDocument: ActionResult;
  unshareDocument: ActionResult;
  unshareProject: ActionResult;
  updateDocument: ActionResult;
  uploadAudioFile?: Maybe<ActionResult>;
  uploadDocuments?: Maybe<ActionResult>;
};


export type MutationCreateDocumentArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  language: Scalars['String']['input'];
  title: Scalars['String']['input'];
  transcriptionType?: InputMaybe<TranscriptionType>;
};


export type MutationCreateProjectArgs = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationDeleteDocumentArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationShareDocumentArgs = {
  documentId: Scalars['ID']['input'];
  role: Role;
  userEmail: Scalars['String']['input'];
};


export type MutationShareProjectArgs = {
  id: Scalars['ID']['input'];
  role: Role;
  userEmail: Scalars['String']['input'];
};


export type MutationTrashDocumentArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationUnshareDocumentArgs = {
  documentId: Scalars['ID']['input'];
  userEmail: Scalars['String']['input'];
};


export type MutationUnshareProjectArgs = {
  id: Scalars['ID']['input'];
  userEmail: Scalars['String']['input'];
};


export type MutationUpdateDocumentArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUploadAudioFileArgs = {
  doc: DocumentUploadInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUploadDocumentsArgs = {
  docs: Array<DocumentUploadInput>;
};

export type Project = {
  __typename?: 'Project';
  description: Scalars['String']['output'];
  documents?: Maybe<Array<Maybe<Document>>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  sharedWith: Array<Maybe<UserSharing>>;
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
  project?: Maybe<Project>;
  projects?: Maybe<Array<Maybe<Project>>>;
  status?: Maybe<ActionResult>;
};


export type QueryProjectArgs = {
  id: Scalars['ID']['input'];
};

export const Role = {
  Admin: 'ADMIN',
  Member: 'MEMBER'
} as const;

export type Role = typeof Role[keyof typeof Role];
export type StatusResponse = {
  __typename?: 'StatusResponse';
  message: Scalars['String']['output'];
};

export type TranscriptionMetadata = {
  __typename?: 'TranscriptionMetadata';
  dialects?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  language: Scalars['String']['output'];
  speakersCount?: Maybe<Scalars['Int']['output']>;
};

export const TranscriptionStatus = {
  Completed: 'COMPLETED',
  InProgress: 'IN_PROGRESS',
  NotStarted: 'NOT_STARTED'
} as const;

export type TranscriptionStatus = typeof TranscriptionStatus[keyof typeof TranscriptionStatus];
export const TranscriptionType = {
  Automatic: 'AUTOMATIC',
  Manual: 'MANUAL'
} as const;

export type TranscriptionType = typeof TranscriptionType[keyof typeof TranscriptionType];
export type User = IUser & {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type UserSharing = IUser & {
  __typename?: 'UserSharing';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: Role;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = {
  IUser: ( User ) | ( UserSharing );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ActionResult: ResolverTypeWrapper<ActionResult>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Document: ResolverTypeWrapper<Document>;
  DocumentUploadInput: DocumentUploadInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  IUser: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['IUser']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Project: ResolverTypeWrapper<Project>;
  Query: ResolverTypeWrapper<{}>;
  Role: Role;
  StatusResponse: ResolverTypeWrapper<StatusResponse>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  TranscriptionMetadata: ResolverTypeWrapper<TranscriptionMetadata>;
  TranscriptionStatus: TranscriptionStatus;
  TranscriptionType: TranscriptionType;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
  User: ResolverTypeWrapper<User>;
  UserSharing: ResolverTypeWrapper<UserSharing>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ActionResult: ActionResult;
  Boolean: Scalars['Boolean']['output'];
  Document: Document;
  DocumentUploadInput: DocumentUploadInput;
  ID: Scalars['ID']['output'];
  IUser: ResolversInterfaceTypes<ResolversParentTypes>['IUser'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Project: Project;
  Query: {};
  StatusResponse: StatusResponse;
  String: Scalars['String']['output'];
  TranscriptionMetadata: TranscriptionMetadata;
  Upload: Scalars['Upload']['output'];
  User: User;
  UserSharing: UserSharing;
};

export type ActionResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ActionResult'] = ResolversParentTypes['ActionResult']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DocumentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Document'] = ResolversParentTypes['Document']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isTrashed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastModified?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  projectId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sharedWith?: Resolver<Array<Maybe<ResolversTypes['UserSharing']>>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  transcriptionMetadata?: Resolver<Maybe<ResolversTypes['TranscriptionMetadata']>, ParentType, ContextType>;
  transcriptionStatus?: Resolver<ResolversTypes['TranscriptionStatus'], ParentType, ContextType>;
  transcriptionType?: Resolver<ResolversTypes['TranscriptionType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IUserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IUser'] = ResolversParentTypes['IUser']> = {
  __resolveType: TypeResolveFn<'User' | 'UserSharing', ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, RequireFields<MutationCreateDocumentArgs, 'language' | 'title'>>;
  createProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationCreateProjectArgs, 'description' | 'name'>>;
  deleteDocument?: Resolver<ResolversTypes['ActionResult'], ParentType, ContextType, RequireFields<MutationDeleteDocumentArgs, 'documentId'>>;
  deleteProject?: Resolver<ResolversTypes['ActionResult'], ParentType, ContextType, RequireFields<MutationDeleteProjectArgs, 'id'>>;
  shareDocument?: Resolver<ResolversTypes['ActionResult'], ParentType, ContextType, RequireFields<MutationShareDocumentArgs, 'documentId' | 'role' | 'userEmail'>>;
  shareProject?: Resolver<ResolversTypes['ActionResult'], ParentType, ContextType, RequireFields<MutationShareProjectArgs, 'id' | 'role' | 'userEmail'>>;
  trashDocument?: Resolver<ResolversTypes['ActionResult'], ParentType, ContextType, RequireFields<MutationTrashDocumentArgs, 'documentId'>>;
  unshareDocument?: Resolver<ResolversTypes['ActionResult'], ParentType, ContextType, RequireFields<MutationUnshareDocumentArgs, 'documentId' | 'userEmail'>>;
  unshareProject?: Resolver<ResolversTypes['ActionResult'], ParentType, ContextType, RequireFields<MutationUnshareProjectArgs, 'id' | 'userEmail'>>;
  updateDocument?: Resolver<ResolversTypes['ActionResult'], ParentType, ContextType, RequireFields<MutationUpdateDocumentArgs, 'documentId'>>;
  uploadAudioFile?: Resolver<Maybe<ResolversTypes['ActionResult']>, ParentType, ContextType, RequireFields<MutationUploadAudioFileArgs, 'doc' | 'documentId'>>;
  uploadDocuments?: Resolver<Maybe<ResolversTypes['ActionResult']>, ParentType, ContextType, RequireFields<MutationUploadDocumentsArgs, 'docs'>>;
};

export type ProjectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  documents?: Resolver<Maybe<Array<Maybe<ResolversTypes['Document']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sharedWith?: Resolver<Array<Maybe<ResolversTypes['UserSharing']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<QueryProjectArgs, 'id'>>;
  projects?: Resolver<Maybe<Array<Maybe<ResolversTypes['Project']>>>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['ActionResult']>, ParentType, ContextType>;
};

export type StatusResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['StatusResponse'] = ResolversParentTypes['StatusResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TranscriptionMetadataResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TranscriptionMetadata'] = ResolversParentTypes['TranscriptionMetadata']> = {
  dialects?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  language?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  speakersCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSharingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSharing'] = ResolversParentTypes['UserSharing']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  ActionResult?: ActionResultResolvers<ContextType>;
  Document?: DocumentResolvers<ContextType>;
  IUser?: IUserResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  StatusResponse?: StatusResponseResolvers<ContextType>;
  TranscriptionMetadata?: TranscriptionMetadataResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  UserSharing?: UserSharingResolvers<ContextType>;
};


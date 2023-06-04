import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../context';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string | number; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Upload: { input: any; output: any; }
};

export type DocumentUploadInput = {
  docType: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  uploadDocuments?: Maybe<SuccessResult>;
};


export type MutationUploadDocumentsArgs = {
  docs: Array<DocumentUploadInput>;
};

export type Query = {
  __typename?: 'Query';
  status?: Maybe<StatusResponse>;
};

export type StatusResponse = {
  __typename?: 'StatusResponse';
  message: Scalars['String']['output'];
};

export type SuccessResult = {
  __typename?: 'SuccessResult';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
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



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DocumentUploadInput: DocumentUploadInput;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  StatusResponse: ResolverTypeWrapper<StatusResponse>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SuccessResult: ResolverTypeWrapper<SuccessResult>;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  DocumentUploadInput: DocumentUploadInput;
  Mutation: {};
  Query: {};
  StatusResponse: StatusResponse;
  String: Scalars['String']['output'];
  SuccessResult: SuccessResult;
  Upload: Scalars['Upload']['output'];
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  uploadDocuments?: Resolver<Maybe<ResolversTypes['SuccessResult']>, ParentType, ContextType, RequireFields<MutationUploadDocumentsArgs, 'docs'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  status?: Resolver<Maybe<ResolversTypes['StatusResponse']>, ParentType, ContextType>;
};

export type StatusResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['StatusResponse'] = ResolversParentTypes['StatusResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SuccessResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SuccessResult'] = ResolversParentTypes['SuccessResult']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type Resolvers<ContextType = Context> = {
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  StatusResponse?: StatusResponseResolvers<ContextType>;
  SuccessResult?: SuccessResultResolvers<ContextType>;
  Upload?: GraphQLScalarType;
};


export type UploadDocumentsMutationVariables = Exact<{
  docs: Array<DocumentUploadInput> | DocumentUploadInput;
}>;


export type UploadDocumentsMutation = { __typename?: 'Mutation', uploadDocuments?: { __typename?: 'SuccessResult', success: boolean, message?: string | null } | null };

export type GetStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStatusQuery = { __typename?: 'Query', status?: { __typename?: 'StatusResponse', message: string } | null };


export const UploadDocumentsDocument = gql`
    mutation UploadDocuments($docs: [DocumentUploadInput!]!) {
  uploadDocuments(docs: $docs) {
    success
    message
  }
}
    `;
export type UploadDocumentsMutationFn = Apollo.MutationFunction<UploadDocumentsMutation, UploadDocumentsMutationVariables>;

/**
 * __useUploadDocumentsMutation__
 *
 * To run a mutation, you first call `useUploadDocumentsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadDocumentsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadDocumentsMutation, { data, loading, error }] = useUploadDocumentsMutation({
 *   variables: {
 *      docs: // value for 'docs'
 *   },
 * });
 */
export function useUploadDocumentsMutation(baseOptions?: Apollo.MutationHookOptions<UploadDocumentsMutation, UploadDocumentsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadDocumentsMutation, UploadDocumentsMutationVariables>(UploadDocumentsDocument, options);
      }
export type UploadDocumentsMutationHookResult = ReturnType<typeof useUploadDocumentsMutation>;
export type UploadDocumentsMutationResult = Apollo.MutationResult<UploadDocumentsMutation>;
export type UploadDocumentsMutationOptions = Apollo.BaseMutationOptions<UploadDocumentsMutation, UploadDocumentsMutationVariables>;
export const GetStatusDocument = gql`
    query GetStatus {
  status {
    message
  }
}
    `;

/**
 * __useGetStatusQuery__
 *
 * To run a query within a React component, call `useGetStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStatusQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetStatusQuery(baseOptions?: Apollo.QueryHookOptions<GetStatusQuery, GetStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStatusQuery, GetStatusQueryVariables>(GetStatusDocument, options);
      }
export function useGetStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStatusQuery, GetStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStatusQuery, GetStatusQueryVariables>(GetStatusDocument, options);
        }
export type GetStatusQueryHookResult = ReturnType<typeof useGetStatusQuery>;
export type GetStatusLazyQueryHookResult = ReturnType<typeof useGetStatusLazyQuery>;
export type GetStatusQueryResult = Apollo.QueryResult<GetStatusQuery, GetStatusQueryVariables>;
import { typeDefs as Common } from './Common.js';
import { typeDefs as Document } from './Document.js';
import { typeDefs as Mutation } from './Mutation.js';
import { typeDefs as Project } from './Project.js';
import { typeDefs as Query } from './Query.js';

export const typeDefs = [Common, Query, Mutation, Project, Document];

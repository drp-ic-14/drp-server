import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Query {
    users: [User]
  }

  type Subscription {
    userAdded: User
  }

  type User {
    id: ID!,
    tasks: [Task]
    groups: [Group]
  }

  type Task {
    id: ID!,
    name: String,
    location: String,
    latitude: Float,
    longitude: Float,
    completed: Boolean
    groupTask: Boolean
    user: User
    userId: String
    group: Group
    groupId: String
  }

  type Group {
    id: ID!
    name: String
    groupTask: [Task]
    users: [User]
  }
`;
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Query {
    users: [User]
  }

  type Subscription {
    userAdded: User
  }

  type User {
    id: ID!
  }
`;
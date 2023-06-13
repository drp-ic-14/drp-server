import { withFilter } from "graphql-subscriptions";
import prisma from "../clients/prisma";
import pubsub from "../clients/pubsub";

export const resolvers = {
  Query: {
    users: () => prisma.user.findMany({
      include: {
        tasks: true,
        groups: {
          include: {
            groupTask: true,
            users: true
          }
        }
      }
    }),
  },
  Subscription: {
    user: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["USER_UPDATE"]),
        (payload, variables) => payload.user.id === variables.id
      ) 
    }
  },
};

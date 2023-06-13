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
    userAdded: {
      subscribe: () => pubsub.asyncIterator(["USER_CREATED"]),
    },
  },
};

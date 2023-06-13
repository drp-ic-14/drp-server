import prisma from "../clients/prisma";
import pubsub from "../clients/pubsub";

export const resolvers = {
  Query: {
    users: () => prisma.user.findMany(),
  },
  Subscription: {
    userAdded: {
      subscribe: () => pubsub.asyncIterator(["USER_CREATED"]),
    },
  },
};

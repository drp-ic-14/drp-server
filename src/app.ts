import express from "express";
import { Prisma } from "@prisma/client";
import morgan from "morgan";
import fetch from "node-fetch";

import prisma from "./clients/prisma.js";
import pubsub from "./clients/pubsub.js";

export const app = express();

interface TypedRequestBody<T> extends Express.Request {
  body: T;
}

interface add_task {
  user_id?: string;
  group_id?: string;
  task: Prisma.TaskCreateInput;
}

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/check_id", async (req, res) => {
  const { user_id } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    })
    res.status(200).json(user ? true : false);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

app.get("/api/generate_id", async (req, res) => {
  const user = await prisma.user.create({
    data: {},
  });

  pubsub.publish("USER_CREATED", {
    userAdded: user,
  });

  res.json(user);
});

app.post("/api/create_user", async (req, res) => {
  const { user_id } = req.body;
  console.log(`Creating new user '${user_id}'.`)

  try {
    const user = await prisma.user.create({
      data: {
        id: user_id
      }
    });

    console.log(`Created new user '${user_id}'.`)
    res.status(200).json(user);
  } catch {
    res.sendStatus(400);
  }
});

app.post("/api/get_user", async (req, res) => {
  const { user_id } = req.body;
  console.log(`Fetching '${user_id}'.`)

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: user_id
      },
      include: {
        groups: {
          include: {
            groupTask: true,
            users: true
          },
        },
        tasks: true
      }
    });

    res.status(200).json(user);
  } catch {
    res.sendStatus(400);
  }
});

app.post("/api/get_tasks", async (req: TypedRequestBody<add_task>, res) => {
  const { user_id } = req.body;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: user_id,
      },
    });
    res.status(200).json(tasks);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

const publish_update = async (group_id: string | null | undefined) => {
  if (group_id) {
    const group = await prisma.group.findUnique({
      where: {
        id: group_id
      },
      include: {
        users: {
          include: {
            groups: {
              include: {
                groupTask: true,
                users: true
              },
            },
            tasks: true
          }
        }
      }
    });

    const users = group?.users || [];

    for (const user of users) {
      pubsub.publish('USER_UPDATE', {
        user: user
      });
    }
  }
}

app.post("/api/add_task", async (req: TypedRequestBody<add_task>, res) => {
  const { user_id, task, group_id } = req.body;
  try {
    const new_task = await prisma.task.create({
      data: {
        name: task.name,
        location: task.location,
        vicinity: task.vicinity,
        latitude: task.latitude,
        longitude: task.longitude,
        userId: user_id || undefined,
        groupId: group_id || undefined,
      },
    });

    publish_update(group_id);

    res.status(200).json(new_task);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

app.post("/api/update_task", async (req, res) => {
  const { task_id, task } = req.body;
  try {
    const new_task = await prisma.task.update({
      where:{
        id: task_id,
      },
      data: {
        name: task.name,
        location: task.location,
        vicinity: task.vicinity,
        latitude: task.latitude,
        longitude: task.longitude,
        description: task.description,
      },
    });

    publish_update(new_task.groupId);

    res.status(200).json(new_task);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

app.post("/api/delete_task", async (req, res) => {
  const { task_id } = req.body;

  try {
    const deleted_task = await prisma.task.delete({
      where: {
        id: task_id,
      },
    });

    publish_update(deleted_task.groupId);

    res.status(200).json(deleted_task);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

app.post("/api/create_group", async (req, res) => {
  const { group_name, user_id } = req.body;
  try {
    const new_group = await prisma.group.create({
      data: {
        name: group_name,
        users: {
          connect: {
            id: user_id,
          },
        },
      },
    });
    res.status(200).json(new_group);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

app.post("/api/join_group", async (req, res) => {
  const { user_id, group_id } = req.body;
  try {
    const join_group = await prisma.group.update({
      where: {
        id: group_id,
      },
      data: {
        users: {
          connect: {
            id: user_id,
          },
        },
      },
      include: {
        users: true,
      },
    });

    publish_update(group_id);

    res.status(200).json(join_group);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

app.get("/api/search_location", async (req, res) => {
  try {
    const { query, latitude, longitude } = req.query as {
      query: string;
      latitude: string;
      longitude: string;
    };
    const radius = 1000;
    console.log("Search params:", query, latitude, longitude);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${query}&location=${latitude}%2C${longitude}&radius=${radius}&key=${process.env.GOOGLE_MAPS_API}`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

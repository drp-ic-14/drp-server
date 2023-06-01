import express from "express";
import { Prisma } from '@prisma/client'
import prisma from "./prisma";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

export interface TypedRequestBody<T> extends Express.Request {
  body: T
}

interface add_task {
  user_id: string;
  task: Prisma.TaskCreateInput;
}

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/generate_id', async (req, res) => {
  const user = await prisma.user.create({
    data: {}
  });

  res.json(user);
});

app.post('/api/add_task', async (req: TypedRequestBody<add_task>, res) => {
  const { user_id, task } = req.body;

  const new_task = await prisma.task.create({
    data: {
      name: task.name,
      location: task.location,
      userId: user_id
    }
  });

  res.status(200).json(new_task);
});

app.post('/api/complete_task', async (req, res) => {
  const { user_id, task_id } = req.body;

  const completed_task = await prisma.task.update({
    where: {
      id: task_id,
      userId: user_id
    },
    data: {
      completed: true
    }
  });

  res.status(200).json(completed_task);
});

app.post('/api/delete_task', async (req, res) => {
  const { user_id, task_id } = req.body;

  const deleted_task = await prisma.task.delete({
    where: {
      id: task_id,
      userId: user_id
    }
  });

  res.status(200).json(deleted_task);
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const withTasks = { include: { tasks: { orderBy: { createdAt: "asc" } } } };

// GET /api/changes
router.get("/", async (_req, res) => {
  try {
    const changes = await prisma.change.findMany({
      ...withTasks,
      orderBy: { createdAt: "desc" },
    });
    res.json(changes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/changes/:id
router.get("/:id", async (req, res) => {
  try {
    const change = await prisma.change.findUniqueOrThrow({
      where: { id: req.params.id },
      ...withTasks,
    });
    res.json(change);
  } catch (e) {
    res.status(404).json({ error: "Not found" });
  }
});

// POST /api/changes
router.post("/", async (req, res) => {
  try {
    const last = await prisma.change.findFirst({ orderBy: { id: "desc" } });
    const num  = last ? parseInt(last.id.replace("CHG", "")) + 1 : 1;
    const id   = "CHG" + String(num).padStart(4, "0");

    const {
      title, type, description, justification, risk,
      impact, plannedStart, plannedEnd, rollback, service,
      attachments, templateId, requester, stage,
    } = req.body;

    const change = await prisma.change.create({
      data: {
        id, type, title, description, justification, risk,
        impact:       impact       || null,
        plannedStart: plannedStart || null,
        plannedEnd:   plannedEnd   || null,
        rollback:     rollback     || null,
        service:      service      || null,
        attachments:  attachments  || [],
        templateId:   templateId   || null,
        requester:    requester    || "Unknown",
        stage:        stage        || "New",
        cabVotes: {},
      },
      ...withTasks,
    });
    res.status(201).json(change);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/changes/:id  — update any top-level fields
router.patch("/:id", async (req, res) => {
  try {
    // Strip out relational/non-column keys the client might send
    const { tasks, createdAt, ...data } = req.body;
    const change = await prisma.change.update({
      where: { id: req.params.id },
      data,
      ...withTasks,
    });
    res.json(change);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/changes/:id/tasks
router.post("/:id/tasks", async (req, res) => {
  try {
    const lastTask = await prisma.task.findFirst({ orderBy: { id: "desc" } });
    const num      = lastTask ? parseInt(lastTask.id.replace("TASK", "")) + 1 : 1;
    const taskId   = "TASK" + String(num).padStart(4, "0");

    const { title, description, assignedTo, dueDate, priority, createdBy } = req.body;

    const task = await prisma.task.create({
      data: {
        id: taskId,
        title,
        description: description || null,
        assignedTo:  assignedTo  || null,
        dueDate:     dueDate     || null,
        priority:    priority    || "Medium",
        status: "Open",
        createdBy: createdBy || null,
        changeId: req.params.id,
      },
    });
    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/changes/:changeId/tasks/:taskId
router.patch("/:changeId/tasks/:taskId", async (req, res) => {
  try {
    const { createdAt, changeId, ...data } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data,
    });
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

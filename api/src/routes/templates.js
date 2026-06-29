import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/templates
router.get("/", async (_req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(templates);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/templates
router.post("/", async (req, res) => {
  try {
    const last = await prisma.template.findFirst({ orderBy: { id: "desc" } });
    const num  = last ? parseInt(last.id.replace("SCT", "")) + 1 : 1;
    const id   = "SCT" + String(num).padStart(3, "0");

    const { title, description, justification, risk, rollback, service, rationale, proposedBy } = req.body;

    const template = await prisma.template.create({
      data: {
        id,
        title,
        description:  description  || "",
        justification: justification || null,
        risk:         risk          || "Low",
        rollback:     rollback      || null,
        service:      service       || null,
        rationale:    rationale     || null,
        status: "Pending CAB Approval",
        proposedBy: proposedBy || null,
        proposedAt: new Date().toISOString().slice(0, 10),
        usageCount: 0,
      },
    });
    res.status(201).json(template);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/templates/:id
router.patch("/:id", async (req, res) => {
  try {
    const { createdAt, ...data } = req.body;
    const template = await prisma.template.update({
      where: { id: req.params.id },
      data,
    });
    res.json(template);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const SubjectRouter = express.Router();

// Define routes for subjects
SubjectRouter.get("/", async (req, res) => {
  try {
    // Fetch subjects from the database (placeholder)
    const { search, department } = req.query;
    const rawPage = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
    const rawLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;

    const parsedPage = parseInt(String(rawPage ?? "1"), 10);
    const currentPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    const parsedLimit = parseInt(String(rawLimit ?? "10"), 10);
    let limitPerPage = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit;
    limitPerPage = Math.min(limitPerPage, 100);

    const offset = (currentPage - 1) * limitPerPage;
    const filterConditions = [];
    //If search query exist filter by name or code
    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        ),
      );
    }

    // If department query exist filter by department name
    if (department) {
      //escape sql injection characters in department query
      const deptPattern = `%${String(department).replace(/[%_]/g, "\\$&")}%`;
      filterConditions.push(ilike(departments.name, deptPattern));
    }

    //combine filters using AND if exist
    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;
    const countResult = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;
    const subjectLists = await db
      .select({
        ...getTableColumns(subjects),
        departments: { ...getTableColumns(departments) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectLists,
      pagination: {
        total: totalCount,
        page: currentPage,
        limit: limitPerPage,
        pages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to get subjects" });
  }
});

export default SubjectRouter;

import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";
import { get } from "node:http";
import { count } from "node:console";

const SubjectRouter = express.Router();

// Define routes for subjects
SubjectRouter.get("/", async (req, res) => {
  try {
    // Fetch subjects from the database (placeholder)
    const { search, department, page = 1, limit = 10 } = req.query;
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);
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
      filterConditions.push(ilike(departments.name, `%${department}%`));
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

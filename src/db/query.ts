"use server";
import { drizzle } from "drizzle-orm/node-postgres";

import { db, pool } from ".";
import {
  courseModules,
  links,
  students,
  utlinks,
  users,
  classes,
} from "./schema";
import { eq } from "drizzle-orm";

export type SelectModule = typeof courseModules.$inferSelect;
export type InsertModule = typeof courseModules.$inferInsert;
export async function insertCourseModule(
  title: string,
  intro: string | null,
  classId: number,
): Promise<InsertModule> {
  try {
    const result = await db
      .insert(courseModules)
      .values({ title, intro, classId })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Failed to insert course module:", error);
    throw new Error("Failed to insert course module");
  }
}

export async function selectCourseModule(id: number): Promise<SelectModule> {
  try {
    const smodule = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, id));
    return smodule[0];
  } catch (error) {
    console.error(error);
    throw new Error("error");
  }
}

export async function selectAllCourseModules(): Promise<SelectModule[]> {
  try {
    const modules = await db.select().from(courseModules);
    return modules;
  } catch (error) {
    console.error(error);
    throw new Error("error");
  }
}

export async function selectAllCourseModulesByClassId(
  classId: number,
): Promise<SelectModule[]> {
  try {
    const allClasses = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.classId, classId));
    return allClasses;
  } catch (error) {
    console.error(error);
    throw new Error("error");
  }
}

export async function updateCourseModule(
  moduleId: number,
  updatedTitle: string,
  updatedIntro: string,
) {
  try {
    await db
      .update(courseModules)
      .set({ title: updatedTitle, intro: updatedIntro })
      .where(eq(courseModules.id, moduleId));
  } catch (error) {
    console.error(error);
    throw new Error("error");
  }
}

export async function deleteCourseModule(moduleId: number) {
  try {
    await db.delete(courseModules).where(eq(courseModules.id, moduleId));
  } catch (error) {
    console.error(error);
    throw new Error("error");
  }
}

export type SelectUtlink = typeof utlinks.$inferSelect;
export type InsertUtlink = typeof utlinks.$inferInsert;
export async function insertUtlink(
  courseModulesId: number,
  url: string,
  title: string,
  description: string | null,
): Promise<InsertUtlink> {
  try {
    const utlink = await db
      .insert(utlinks)
      .values({ courseModulesId, url, title, description })
      .returning();
    return utlink[0];
  } catch (error) {
    console.error(error);
    throw new Error("error");
  }
}

export async function selectUtlinksByModule(
  moduleId: number,
): Promise<SelectUtlink[]> {
  try {
    const links = await db
      .select()
      .from(utlinks)
      .where(eq(utlinks.courseModulesId, moduleId));

    return links;
  } catch (error) {
    console.error("Failed to select utlinks:", error);
    throw new Error("Failed to select utlinks");
  }
}

export type SelectLink = typeof links.$inferSelect;
export type InsertLink = typeof links.$inferInsert;
export async function insertLink(
  courseModulesId: number,
  url: string,
  title: string,
): Promise<InsertLink> {
  try {
    const link = await db
      .insert(links)
      .values({ title, courseModulesId, url })
      .returning();
    return link[0];
  } catch (error) {
    console.error(error);
    throw new Error("error");
  }
}

export async function selectLinksByModule(
  moduleId: number,
): Promise<SelectLink[]> {
  try {
    const link = await db
      .select()
      .from(links)
      .where(eq(links.courseModulesId, moduleId));
    return link;
  } catch (error) {
    console.error("Failed to select utlinks:", error);
    throw new Error("Failed to select utlinks");
  }
}

export interface combinedLink {
  id: number;
  title: string;
  description: string | null;
  courseModulesId: number;
  url: string;
}

export async function selectAllLinksByModule(
  moduleId: number,
): Promise<combinedLink[]> {
  const [links, utlinks] = await Promise.all([
    selectLinksByModule(moduleId),
    selectUtlinksByModule(moduleId),
  ]);

  const combinedLinks: combinedLink[] = [...links, ...utlinks];
  return combinedLinks;
}

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type SelectStudent = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

export async function createStudentAndUserIfNotExists(
  userId: string,
  name: string,
): Promise<{ user: SelectUser | null; student: SelectStudent | null }> {
  const existingStudent = await db
    .select()
    .from(students)
    .where(eq(students.userId, userId))
    .then((result) => result[0] || null);

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .then((result) => result[0] || null);

  let newUser = existingUser;
  let newStudent = existingStudent;

  if (!existingUser) {
    [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        role: "student",
      })
      .returning();
  }

  if (!existingStudent) {
    [newStudent] = await db
      .insert(students)
      .values({
        userId: userId,
        name: name,
      })
      .returning();
  }

  if (newUser !== existingUser || newStudent !== existingStudent) {
    console.log("CREATED NEW OBJECTS\n\n\n");
    console.log(newUser);
    console.log(newStudent);
  } else {
    console.log("RETRIEVED EXISTING OBJECTS\n\n\n");
    console.log(newUser);
    console.log(newStudent);
  }

  return { user: newUser, student: newStudent };
}

export async function addGitHubUsername(
  userId: string,
  githubUsername: string,
) {
  await db
    .update(students)
    .set({ github: githubUsername })
    .where(eq(students.userId, userId));
}

export async function getGithubUserInfo(userId: string) {
  const Userinfo = await db
    .select()
    .from(students)
    .where(eq(students.userId, userId));
  return Userinfo;
}

export async function getAllStudentInfo() {
  try {
    const allStudentInfo = await db.select().from(students);
    console.log("Fetched students:", allStudentInfo);
    return allStudentInfo ?? [];
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
}

export type SelectClasses = typeof classes.$inferSelect;
export type InsertClasses = typeof classes.$inferInsert;
export async function selectAllClasses(): Promise<SelectClasses[]> {
  try {
    const allClasses = await db.select().from(classes);
    return allClasses;
  } catch (error) {
    console.log(error);
    throw new Error("could not get classes");
  }
}

export async function editClassName(classId: number, className: string) {
  try {
    await db
      .update(classes)
      .set({ name: className })
      .where(eq(classes.id, classId));
  } catch (error) {
    console.log(error);
    throw new Error("could not get classes");
  }
}

export async function deleteClass(classId: number) {
  try {
    await db.delete(classes).where(eq(classes.id, classId));
  } catch (error) {
    console.error(error);
    throw new Error("error");
  }
}

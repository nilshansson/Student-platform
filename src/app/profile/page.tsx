"use server";

import { auth } from "@clerk/nextjs/server";
import { handleCreateUserIfNotExist } from "@/actions/actions";
import { getCourseDatesByClassId } from "@/db/query";
import { GithubForm } from "./github-form";
import CommitTracker from "../_components/commit-tracker";
import ClassMaterial from "./class-material";

export default async function ProfilePage() {
  const clerkAuth = await auth();
  if (!clerkAuth) {
    return <div>Please sign in to view your profile.</div>;
  }
  const userId = clerkAuth.userId;

  const user = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  }).then((res) => res.json());

  const name = `${user.first_name} ${user.last_name}`;
  const { student } = await handleCreateUserIfNotExist(userId!, name);
  if (!student) {
    throw new Error("Could not load or create user");
  }

  let content;

  if (student.classId) {
    const { precourseStart, bootcampStart } = await getCourseDatesByClassId(
      student.classId
    );

    content = student.github ? (
      <>
        <h1 className="text-saltDarkPink">Commits since precourse start:</h1>
        <CommitTracker
          student={student}
          precourseStart={precourseStart}
          bootcampStart={bootcampStart}
        />
      </>
    ) : (
      <GithubForm student={student} />
    );
  } else {
    content = <h1>Please ask admin to assign a class to you</h1>;
  }

  return (
    <main className=" min-h-screen p-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card col-span-1 shadow-xl bg-saltDarkBlue h-160">
          <div className="card-body flex flex-col items-center justify-center text-center ">
            <h1 className="text-lg font-bold mb-4 text-white">
              Welcome, {user.first_name} {user.last_name}!
            </h1>
            {user.image_url && (
              <img
                src={user.image_url}
                alt="User Profile Picture"
                width={150}
                height={150}
                className="rounded-full mb-4"
              />
            )}
            {content}
          </div>
        </div>

        <div className="col-span-2">
          <ClassMaterial />
        </div>
      </div>
    </main>
  );
}

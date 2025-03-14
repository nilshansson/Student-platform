export type Student = {
  id: number;
  name: string;
  userId: string | null;
  classId: number | null;
  github: string | null;
};

export type ClassType = {
  id: number;
  name: string;
};

export interface EditClassesFormProps {
  allStudents: Student[];
  allClasses: ClassType[];
}

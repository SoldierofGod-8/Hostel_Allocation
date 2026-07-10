import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const sampleStudent = {
  uid: "stud_alex_99",
  name: "Alex Ngozi",
  email: "alex.n@university.edu",
  role: "student",
  gender: "male",
  academicLevel: 400,
  isEligible: true,
  currentAllocationId: null
};

export async function seedMockStudent() {
  const userRef = doc(db, "users", sampleStudent.uid);
  await setDoc(userRef, sampleStudent, { merge: true });
  console.log("Mock student profile synchronized with Firestore!");
}

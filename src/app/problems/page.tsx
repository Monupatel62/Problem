import { redirect } from "next/navigation";

// /problems → / (problems list is now at root)
export default function ProblemsRedirect() {
  redirect("/");
}

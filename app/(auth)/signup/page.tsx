import { redirect } from "next/navigation";

// Magic link handles signup automatically — no separate form needed
export default function SignupPage() {
  redirect("/login");
}

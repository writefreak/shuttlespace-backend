// app/(client)/page.tsx
import { redirect } from "next/navigation";

export default function DashboardRedirect() {
  redirect("/admin/dashboard");
}

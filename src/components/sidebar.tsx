import { BookOpen, House, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import React from "react";

const Sidebar = () => {
  return (
    <div>
      <div className="bg-red-900 h-screen shadow-xl p-4">
        <div className="flex flex-col gap-10">
          {links.map((l) => (
            <Link
              href={l.url}
              key={l.id}
              className="flex items-center gap-3 pt-4"
            >
              {l.icon}
              <span className="text-white text-sm">{l.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

const links = [
  {
    id: 1,
    icon: <LayoutDashboard color="white" height={20} width={20} />,
    title: "Dashboard",
    url: "/studentDashboard/dashboard",
  },
  {
    id: 2,
    icon: <BookOpen color="white" height={20} width={20} />,
    title: "Results",
    url: "/studentDashboard/results",
  },
  {
    id: 3,
    icon: <House color="white" height={20} width={20} />,
    title: "Accomodation",
    url: "/studentDashboard/accomodation",
  },
];


import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { BarChart2, Users, TrendingUp } from "lucide-react";
import { focusRingClasses } from "@/lib/accessibility";

interface QuickLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  ariaLabel: string;
  iconBgClass: string;
  iconTextClass: string;
}

const QuickLink = ({ to, icon, title, description, ariaLabel, iconBgClass, iconTextClass }: QuickLinkProps) => (
  <Card className="hover:shadow-md transition-all duration-200">
    <Link 
      to={to} 
      className={`block p-6 ${focusRingClasses}`}
      aria-label={ariaLabel}
    >
      <div className="flex items-center space-x-4">
        <div className={`${iconBgClass} p-3 rounded-full`} aria-hidden="true">
          <div className={`h-6 w-6 ${iconTextClass}`}>
            {icon}
          </div>
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  </Card>
);

export default function QuickLinks() {
  const links = [
    {
      to: "/analytics",
      icon: <BarChart2 />,
      title: "Analytics",
      description: "View detailed reports and metrics",
      ariaLabel: "View analytics reports and metrics",
      iconBgClass: "bg-blue-100 dark:bg-blue-900",
      iconTextClass: "text-blue-600 dark:text-blue-300"
    },
    {
      to: "/clients",
      icon: <Users />,
      title: "Students",
      description: "Manage student profiles",
      ariaLabel: "Manage student profiles",
      iconBgClass: "bg-green-100 dark:bg-green-900",
      iconTextClass: "text-green-600 dark:text-green-300"
    },
    {
      to: "/renewals",
      icon: <TrendingUp />,
      title: "Renewals",
      description: "Track and manage renewals",
      ariaLabel: "Track and manage renewals",
      iconBgClass: "bg-purple-100 dark:bg-purple-900",
      iconTextClass: "text-purple-600 dark:text-purple-300"
    }
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" aria-label="Quick navigation links">
      {links.map((link) => (
        <QuickLink key={link.to} {...link} />
      ))}
    </section>
  );
}

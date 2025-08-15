import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, GraduationCap, AlertTriangle, TrendingUp } from "lucide-react";

interface StudentStatsProps {
  totalStudents: number;
  activeStudents: number;
  newStudents: number;
  graduatedStudents: number;
  atRiskStudents: number;
}

export function StudentStats({ 
  totalStudents, 
  activeStudents, 
  newStudents, 
  graduatedStudents, 
  atRiskStudents 
}: StudentStatsProps) {
  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Active Students",
      value: activeStudents,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "New Students",
      value: newStudents,
      icon: UserPlus,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Graduates",
      value: graduatedStudents,
      icon: GraduationCap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950"
    },
    {
      title: "At Risk",
      value: atRiskStudents,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.title === "New Students" && newStudents > 0 && "Require onboarding"}
                {stat.title === "At Risk" && atRiskStudents > 0 && "Need attention"}
                {stat.title === "Active Students" && "Currently enrolled"}
                {stat.title === "Graduates" && "Completed programs"}
                {stat.title === "Total Students" && "All time"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, FileQuestion, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import { getAllLectures } from "@/services/lectureService";
import { getAllLessonsEnriched } from "@/services/lessonService";
import { getAllQuizzesEnriched } from "@/services/quizService";

export default async function AdminDashboardPage() {
  const lecturesData = await getAllLectures();
  const lessonsData = await getAllLessonsEnriched();
  const quizzesData = await getAllQuizzesEnriched();

  // User count is typically an admin SDK operation or a denormalized counter in Firestore.
  // Client-side SDK cannot list all users for a direct count.
  const usersCount = "N/A"; 

  const stats = [
    { title: "Total Lectures", value: lecturesData.length.toString(), icon: BookText, color: "text-primary" },
    { title: "Total Lessons", value: lessonsData.length.toString(), icon: FileQuestion, color: "text-accent" },
    { title: "Total Quizzes", value: quizzesData.length.toString(), icon: BarChart3, color: "text-primary" }, 
    { title: "Registered Users", value: usersCount, icon: Users, color: "text-accent" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of ChemLearn content and activity.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and content additions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "New lecture 'Organic Chemistry Basics' added.",
                "Quiz for 'Atomic Structure' updated with AI-generated questions.",
                "User 'Alice' completed 'Introduction to Chemistry'.",
                "New lesson on 'Thermodynamics' published.",
              ].map((activity, index) => (
                <li key={index} className="text-sm text-muted-foreground border-l-2 pl-3 border-primary/50 py-1">
                  {activity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Quick links to manage app content.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {[
              { name: "Lectures", href: "/admin/lectures" },
              { name: "Lessons", href: "/admin/lessons" },
              { name: "Quizzes", href: "/admin/quizzes" },
              { name: "Users", href: "#" /* /admin/users - Future feature */ },
            ].map((item) => (
              <Link key={item.name} href={item.href} className="block p-4 rounded-md border hover:bg-secondary/50 transition-colors">
                <h3 className="font-medium text-foreground">{item.name}</h3>
                <p className="text-xs text-muted-foreground">Manage {item.name.toLowerCase()}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


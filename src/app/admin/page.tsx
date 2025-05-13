
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, FileQuestion, Users, BarChart3, Activity as ActivityIcon } from "lucide-react"; // Added ActivityIcon
import Link from "next/link";
import { getAllLectures } from "@/services/lectureService";
import { getAllLessonsEnriched } from "@/services/lessonService";
import { getAllQuizzesEnriched } from "@/services/quizService";
import { getRecentActivities } from "@/services/activityService"; // Import activity service
import type { Activity } from "@/types";
import { formatDistanceToNow } from 'date-fns'; // For relative time formatting

export default async function AdminDashboardPage() {
  const lecturesData = await getAllLectures();
  const lessonsData = await getAllLessonsEnriched();
  const quizzesData = await getAllQuizzesEnriched();
  const recentActivities: Activity[] = await getRecentActivities(5);

  // User count is typically an admin SDK operation or a denormalized counter in Firestore.
  // Client-side SDK cannot list all users for a direct count.
  // For now, we'll keep this as N/A or implement user count via Admin SDK if Firebase Functions are introduced.
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
            {recentActivities.length > 0 ? (
              <ul className="space-y-3">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="text-sm text-muted-foreground border-l-2 pl-3 border-primary/50 py-1.5">
                    <div className="flex justify-between items-start">
                      <span className="flex-1">{activity.message}</span>
                      <span className="text-xs text-muted-foreground/70 whitespace-nowrap ml-2">
                        {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <ActivityIcon className="mx-auto h-10 w-10 mb-2" />
                No recent activity recorded.
              </div>
            )}
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
              { name: "Users", href: "#" /* /admin/users - Placeholder */ },
            ].map((item) => (
              <Link key={item.name} href={item.href} className={`block p-4 rounded-md border hover:bg-secondary/50 transition-colors ${item.href === '#' ? 'opacity-50 cursor-not-allowed' : ''}`}>
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

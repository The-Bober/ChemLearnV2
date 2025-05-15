
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, FileQuestion, Users, BarChart3, Activity as ActivityIcon } from "lucide-react"; // Added ActivityIcon
import Link from "next/link";
import { getAllLectures } from "@/services/lectureService";
import { getAllLessonsEnriched } from "@/services/lessonService";
import { getAllQuizzesEnriched } from "@/services/quizService";
import { getRecentActivities } from "@/services/activityService"; // Import activity service
import type { Activity } from "@/types";
import { formatDistanceToNow } from 'date-fns'; // For relative time formatting
import { translationsStore, type Locale } from "@/lib/translations";

// Helper to get translations on the server for a specific locale
const getTranslationsForServer = (locale: string = 'en') => {
  return translationsStore[locale as Locale] || translationsStore['en'];
};

export default async function AdminDashboardPage() {
  const t = getTranslationsForServer('en'); // Or pass locale if available
  const lecturesData = await getAllLectures();
  const lessonsData = await getAllLessonsEnriched();
  const quizzesData = await getAllQuizzesEnriched();
  const recentActivities: Activity[] = await getRecentActivities(5);

  // User count is typically an admin SDK operation or a denormalized counter in Firestore.
  // Client-side SDK cannot list all users for a direct count.
  // For now, we'll keep this as N/A or implement user count via Admin SDK if Firebase Functions are introduced.
  const usersCount = "N/A"; 

  const stats = [
    { titleKey: "adminDashboard.totalLectures", value: lecturesData.length.toString(), icon: BookText, color: "text-primary" },
    { titleKey: "adminDashboard.totalLessons", value: lessonsData.length.toString(), icon: FileQuestion, color: "text-accent" },
    { titleKey: "adminDashboard.totalQuizzes", value: quizzesData.length.toString(), icon: BarChart3, color: "text-primary" }, 
    { titleKey: "adminDashboard.registeredUsers", value: usersCount, icon: Users, color: "text-accent" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t['adminDashboard.title']}</h1>
        <p className="text-muted-foreground">{t['adminDashboard.description']}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.titleKey} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t[stat.titleKey]}</CardTitle>
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
            <CardTitle>{t['adminDashboard.recentActivityTitle']}</CardTitle>
            <CardDescription>{t['adminDashboard.recentActivityDescription']}</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <ul className="space-y-3">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="text-sm text-muted-foreground border-l-2 pl-3 border-primary/50 py-1.5">
                    <div className="flex justify-between items-start">
                      <span className="flex-1">{activity.message}</span>
                      <span className="text-xs text-muted-foreground/70 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <ActivityIcon className="mx-auto h-10 w-10 mb-2" />
                {t['adminDashboard.noRecentActivity']}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t['adminDashboard.contentManagementTitle']}</CardTitle>
            <CardDescription>{t['adminDashboard.contentManagementDescription']}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {[
              { nameKey: "adminDashboard.linkLectures", href: "/admin/lectures", manageKey: "adminDashboard.manageLectures" },
              { nameKey: "adminDashboard.linkLessons", href: "/admin/lessons", manageKey: "adminDashboard.manageLessons" },
              { nameKey: "adminDashboard.linkQuizzes", href: "/admin/quizzes", manageKey: "adminDashboard.manageQuizzes" },
              { nameKey: "adminDashboard.linkUsers", href: "#" /* /admin/users - Placeholder */, manageKey: "adminDashboard.manageUsers" },
            ].map((item) => (
              <Link key={item.nameKey} href={item.href} className={`block p-4 rounded-md border hover:bg-secondary/50 transition-colors ${item.href === '#' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <h3 className="font-medium text-foreground">{t[item.nameKey]}</h3>
                <p className="text-xs text-muted-foreground">{t[item.manageKey]}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Plane, CheckSquare, MessageCircle, Heart } from "lucide-react";

export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    diaryEntries: 0,
    travelPosts: 0,
    tasks: 0,
    messages: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [diary, travel, tasks, messages, likes] = await Promise.all([
        supabase.from("diary_entries").select("*", { count: "exact", head: true }),
        supabase.from("travel_posts").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("post_likes").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        diaryEntries: diary.count || 0,
        travelPosts: travel.count || 0,
        tasks: tasks.count || 0,
        messages: messages.count || 0,
        totalLikes: likes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Diary Entries",
      value: stats.diaryEntries,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      title: "Travel Posts",
      value: stats.travelPosts,
      icon: Plane,
      color: "text-secondary",
    },
    {
      title: "Tasks",
      value: stats.tasks,
      icon: CheckSquare,
      color: "text-accent",
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: MessageCircle,
      color: "text-primary",
    },
    {
      title: "Total Likes",
      value: stats.totalLikes,
      icon: Heart,
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-rounded mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className={`w-12 h-12 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="text-muted-foreground font-rounded">
          Use the tabs above to manage your content, view messages, and configure settings.
        </div>
      </Card>
    </div>
  );
};

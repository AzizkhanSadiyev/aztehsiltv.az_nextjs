"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderTree, Users, Check, Video, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatCard, SectionCard } from "@/components/admin/ui";

interface DashboardStats {
  videos: { total: number; published: number };
  categories: number;
  users: number;
  media: number;
}

interface RecentVideo {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface TaskItem {
  id: string;
  title: string;
  time: string;
  completed: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: "review", title: "Review scheduled videos", time: "Today - 3 items", completed: false },
    { id: "media", title: "Clean up unused media", time: "Tomorrow - 14 files", completed: false },
    { id: "permissions", title: "Audit editor permissions", time: "This week", completed: true },
    { id: "report", title: "Prepare weekly report", time: "Friday", completed: false },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          videosRes,
          videosPublishedRes,
          categoriesRes,
          usersRes,
          mediaRes,
        ] = await Promise.all([
          fetch("/api/videos?limit=5"),
          fetch("/api/videos?status=published&limit=1"),
          fetch("/api/categories"),
          fetch("/api/users"),
          fetch("/api/media?limit=1"),
        ]);

        const videos = await videosRes.json();
        const publishedVideos = await videosPublishedRes.json();
        const categories = await categoriesRes.json();
        const users = await usersRes.json();
        const media = await mediaRes.json();

        const videosList = videos.data || [];
        const publishedCount =
          publishedVideos.pagination?.total ??
          (publishedVideos.data || []).length ??
          0;

        setStats({
          videos: {
            total: videos.pagination?.total ?? videosList.length,
            published: publishedCount,
          },
          categories: (categories.data || []).length,
          users: (users.data || []).length,
          media: media.pagination?.total ?? (media.data ? 1 : 0),
        });

        setRecentVideos(videosList.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your content performance"
      />

      <div className="admin-stats-grid">
        <Link href="/admin/videos" className="block">
          <StatCard
            label="Videos"
            value={loading ? "-" : stats?.videos.total || 0}
            delta="+12%"
            deltaLabel="from last month"
            icon={Video}
          />
        </Link>
        <Link href="/admin/categories" className="block">
          <StatCard
            label="Categories"
            value={loading ? "-" : stats?.categories || 0}
            delta="+18%"
            deltaLabel="from last month"
            icon={FolderTree}
          />
        </Link>
        <Link href="/admin/users" className="block">
          <StatCard
            label="Users"
            value={loading ? "-" : stats?.users || 0}
            delta="+4%"
            deltaLabel="from last month"
            icon={Users}
          />
        </Link>
        <Link href="/admin/media" className="block">
          <StatCard
            label="Media"
            value={loading ? "-" : stats?.media || 0}
            delta="+6%"
            deltaLabel="from last month"
            icon={Image}
          />
        </Link>
      </div>

      <div className="admin-content-grid-3">
        <SectionCard title="Trend" description="Video performance over time">
          <div className="admin-chart-placeholder">
            <span className="text-sm text-muted-foreground">Chart placeholder</span>
          </div>
        </SectionCard>

        <SectionCard title="Recent activity">
          {recentVideos.length > 0 ? (
            <div className="admin-activity-list">
              {recentVideos.map((video) => (
                <div key={video.id} className="admin-activity-item">
                  <div className="admin-activity-dot" />
                  <div className="admin-activity-content">
                    <p className="admin-activity-title">{video.title}</p>
                    <p className="admin-activity-time">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Upcoming tasks" description="Keep your workflow moving">
        <div className="admin-task-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn("admin-task-item", task.completed && "completed")}
            >
              <button
                type="button"
                className={cn(
                  "admin-task-checkbox",
                  task.completed && "checked"
                )}
                onClick={() => toggleTask(task.id)}
                aria-pressed={task.completed}
              >
                {task.completed && <Check className="h-3.5 w-3.5" />}
              </button>
              <div className="admin-task-content">
                <p className="admin-task-title">{task.title}</p>
                <p className="admin-task-time">{task.time}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

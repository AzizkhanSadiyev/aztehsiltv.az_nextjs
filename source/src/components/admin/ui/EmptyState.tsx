"use client";

import { cn } from "@/lib/utils";
import {
  LucideIcon,
  FileText,
  FolderOpen,
  Image,
  Users,
  Settings,
  Search,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Languages,
  Handshake,
  Sparkles,
  Video,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "search" | "error";
}

const defaultIcons: Record<string, LucideIcon> = {
  articles: FileText,
  categories: FolderOpen,
  media: Image,
  users: Users,
  settings: Settings,
  search: Search,
};

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full mb-4",
          variant === "error" 
            ? "bg-destructive/10 text-destructive" 
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function ArticlesEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No articles yet"
      description="Get started by creating your first article. Articles help you share content with your audience."
      action={onCreateNew ? { label: "Create Article", onClick: onCreateNew } : undefined}
    />
  );
}

export function VideosEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Video}
      title="No videos yet"
      description="Upload or create your first video to start filling the homepage."
      action={onCreateNew ? { label: "Create Video", onClick: onCreateNew } : undefined}
    />
  );
}

export function CategoriesEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No categories yet"
      description="Categories help organize your content. Create your first category to get started."
      action={onCreateNew ? { label: "Create Category", onClick: onCreateNew } : undefined}
    />
  );
}

export function MediaEmptyState({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={Image}
      title="No media files"
      description="Upload images, videos, and documents to use in your content."
      action={onUpload ? { label: "Upload Media", onClick: onUpload } : undefined}
    />
  );
}

export function UsersEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No users found"
      description="Add team members to help manage your content."
      action={onCreateNew ? { label: "Add User", onClick: onCreateNew } : undefined}
    />
  );
}

export function PagesEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No pages yet"
      description="Create static pages like About, Contact, or Privacy Policy."
      action={onCreateNew ? { label: "Create Page", onClick: onCreateNew } : undefined}
    />
  );
}

export function ServicesEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Briefcase}
      title="No services yet"
      description="Add your core service lines so they appear on the site."
      action={onCreateNew ? { label: "Create Service", onClick: onCreateNew } : undefined}
    />
  );
}

export function TrainingsEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={GraduationCap}
      title="No trainings yet"
      description="Publish trainings so they show up on the Trainings pages."
      action={onCreateNew ? { label: "Create Training", onClick: onCreateNew } : undefined}
    />
  );
}

export function TestimonialsEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No testimonials yet"
      description="Add client testimonials so they appear on the homepage."
      action={onCreateNew ? { label: "Create Testimonial", onClick: onCreateNew } : undefined}
    />
  );
}

export function TeamsEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No team members yet"
      description="Add your team members so they appear on the homepage."
      action={onCreateNew ? { label: "Create Team Member", onClick: onCreateNew } : undefined}
    />
  );
}

export function PartnersEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Handshake}
      title="No partners yet"
      description="Add partners so they appear on the homepage."
      action={onCreateNew ? { label: "Create Partner", onClick: onCreateNew } : undefined}
    />
  );
}

export function BroadcastsEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Radio}
      title="No broadcasts yet"
      description="Create broadcasts (shows/playlists) to organize your videos."
      action={onCreateNew ? { label: "Create Broadcast", onClick: onCreateNew } : undefined}
    />
  );
}

export function HomeHeroEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Sparkles}
      title="No hero content yet"
      description="Create the homepage hero section."
      action={onCreateNew ? { label: "Create Hero", onClick: onCreateNew } : undefined}
    />
  );
}

export function HomeAboutEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Image}
      title="No about cards yet"
      description="Create the homepage about cards."
      action={onCreateNew ? { label: "Create Card", onClick: onCreateNew } : undefined}
    />
  );
}

export function TranslationsEmptyState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={Languages}
      title="No translations yet"
      description="Add translation keys to manage localized UI copy."
      action={onCreateNew ? { label: "Create Translation", onClick: onCreateNew } : undefined}
    />
  );
}

export function SearchEmptyState({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        query
          ? `No results found for "${query}". Try adjusting your search or filters.`
          : "Try adjusting your search or filters to find what you're looking for."
      }
      variant="search"
    />
  );
}

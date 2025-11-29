import { useEffect, useState } from "react";
import { Instagram, Twitter, Linkedin, Github, Youtube, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  display_order: number;
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, any> = {
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github,
    youtube: Youtube,
    tiktok: Music,
  };
  return icons[platform.toLowerCase()] || Instagram;
};

export const SocialLinksDisplay = ({ profileId }: { profileId: string }) => {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetchLinks();
  }, [profileId]);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("profile_id", profileId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching social links:", error);
    }
  };

  if (links.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {links.map((link) => {
        const Icon = getPlatformIcon(link.platform);
        return (
          <Button
            key={link.id}
            variant="outline"
            size="icon"
            className="rounded-full hover:scale-110 transition-transform"
            asChild
          >
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <Icon className="w-5 h-5" />
            </a>
          </Button>
        );
      })}
    </div>
  );
};

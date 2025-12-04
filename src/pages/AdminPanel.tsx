import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, FileText, MessageSquare, Gamepad2, Settings, Plus, Share2, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardOverview } from "./AdminPanel/DashboardOverview";
import { ContentManagement } from "./AdminPanel/ContentManagement";
import { ContentCreation } from "./AdminPanel/ContentCreation";
import { MessagesManagement } from "./AdminPanel/MessagesManagement";
import { GamesManagement } from "./AdminPanel/GamesManagement";
import { GameResponsesManagement } from "./AdminPanel/GameResponsesManagement";
import { AdminSettings } from "./AdminPanel/AdminSettings";
import { toast } from "sonner";
import { motion } from "framer-motion";

const AdminPanel = () => {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .maybeSingle();
    setProfile(data);
  };

  const copyProfileUrl = () => {
    if (profile?.username) {
      const url = `${window.location.origin}/u/${profile.username}`;
      navigator.clipboard.writeText(url);
      toast.success("Profile URL copied!");
    }
  };

  const shareProfile = async () => {
    if (profile?.username) {
      const url = `${window.location.origin}/u/${profile.username}`;
      if (navigator.share) {
        await navigator.share({ title: profile.name, url });
      } else {
        copyProfileUrl();
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto py-4 md:py-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl md:text-4xl font-handwriting font-bold text-foreground mb-1 md:mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-rounded">
              Manage your portfolio content
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.username && (
              <>
                <Button variant="outline" size="sm" onClick={copyProfileUrl}>
                  <Copy className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Copy URL</span>
                </Button>
                <Button variant="outline" size="sm" onClick={shareProfile}>
                  <Share2 className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Share</span>
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </motion.div>

        {/* Profile URL Banner */}
        {profile?.username && (
          <motion.div 
            className="mb-6 p-3 md:p-4 bg-primary/10 rounded-lg border border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Your public profile:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs md:text-sm text-primary font-mono truncate">
                {window.location.origin}/u/{profile.username}
              </code>
              <Button variant="ghost" size="sm" onClick={copyProfileUrl}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto">
            <TabsTrigger value="dashboard" className="gap-1 md:gap-2 px-1 md:px-3 py-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-1 md:gap-2 px-1 md:px-3 py-2">
              <Plus className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Create</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1 md:gap-2 px-1 md:px-3 py-2">
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Content</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1 md:gap-2 px-1 md:px-3 py-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="gap-1 md:gap-2 px-1 md:px-3 py-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Games</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1 md:gap-2 px-1 md:px-3 py-2">
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="create">
            <ContentCreation />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesManagement />
          </TabsContent>

          <TabsContent value="games">
            <div className="space-y-6">
              <GamesManagement />
              <GameResponsesManagement />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ImageUploader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, User, Image, Link2 } from "lucide-react";
import { motion } from "framer-motion";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export const AdminSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    location: "",
    hobbies: "",
    profile_picture_url: "",
    cover_photo_url: "",
  });
  
  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newLink, setNewLink] = useState({ platform: "", url: "" });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const [profileRes, linksRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("social_links").select("*").eq("profile_id", user.id).order("display_order"),
      ]);

      if (profileRes.data) {
        setProfile({
          name: profileRes.data.name || "",
          bio: profileRes.data.bio || "",
          location: profileRes.data.location || "",
          hobbies: profileRes.data.hobbies || "",
          profile_picture_url: profileRes.data.profile_picture_url || "",
          cover_photo_url: profileRes.data.cover_photo_url || "",
        });
      }
      
      setSocialLinks(linksRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          bio: profile.bio,
          location: profile.location,
          hobbies: profile.hobbies,
          profile_picture_url: profile.profile_picture_url,
          cover_photo_url: profile.cover_photo_url,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;
      
      toast.success("All changes saved successfully! 🎉");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setProfile(prev => ({ ...prev, profile_picture_url: urls[0] }));
      toast.info("Profile picture ready! Click 'Save All Changes' to apply.");
    }
  };

  const handleCoverPhotoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setProfile(prev => ({ ...prev, cover_photo_url: urls[0] }));
      toast.info("Cover photo ready! Click 'Save All Changes' to apply.");
    }
  };

  const handleAddSocialLink = async () => {
    if (!user || !newLink.platform || !newLink.url) {
      toast.error("Please fill in platform and URL");
      return;
    }

    try {
      new URL(newLink.url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      const { data, error } = await supabase.from("social_links").insert({
        profile_id: user.id,
        platform: newLink.platform.toLowerCase(),
        url: newLink.url,
        display_order: socialLinks.length,
      }).select().single();

      if (error) throw error;
      
      setSocialLinks([...socialLinks, data]);
      setNewLink({ platform: "", url: "" });
      toast.success("Social link added!");
    } catch (error) {
      console.error("Error adding social link:", error);
      toast.error("Failed to add social link");
    }
  };

  const handleDeleteSocialLink = async (id: string) => {
    try {
      const { error } = await supabase.from("social_links").delete().eq("id", id);
      if (error) throw error;
      
      setSocialLinks(socialLinks.filter(link => link.id !== id));
      toast.success("Social link deleted!");
    } catch (error) {
      console.error("Error deleting social link:", error);
      toast.error("Failed to delete social link");
    }
  };

  const platformOptions = [
    "instagram", "twitter", "facebook", "linkedin", "github", 
    "youtube", "tiktok", "pinterest", "discord", "website"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Save All Button - Sticky */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm py-4 -mx-4 px-4 border-b border-border">
        <Button 
          onClick={handleSaveAll} 
          disabled={saving} 
          className="w-full md:w-auto"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving All Changes...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Fill in all details below, then click "Save All Changes"
        </p>
      </div>

      {/* Profile Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-handwriting font-bold text-foreground">
            Profile Information
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-rounded text-foreground mb-2 block">Display Name *</label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-rounded text-foreground mb-2 block">Bio</label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell visitors about yourself..."
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-rounded text-foreground mb-2 block">Location</label>
            <Input
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="🌍 Your location"
            />
          </div>
          <div>
            <label className="text-sm font-rounded text-foreground mb-2 block">Hobbies</label>
            <Input
              value={profile.hobbies}
              onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
              placeholder="✨ Your hobbies"
            />
          </div>
        </div>
      </Card>

      {/* Profile Picture */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-handwriting font-bold text-foreground">
            Profile Picture
          </h3>
        </div>
        <ImageUploader
          bucket="profile-pictures"
          onUploadComplete={handleProfilePictureUpload}
          maxFiles={1}
          existingImages={profile.profile_picture_url ? [profile.profile_picture_url] : []}
        />
      </Card>

      {/* Cover Photo */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-handwriting font-bold text-foreground">
            Cover Photo
          </h3>
        </div>
        <ImageUploader
          bucket="profile-pictures"
          onUploadComplete={handleCoverPhotoUpload}
          maxFiles={1}
          existingImages={profile.cover_photo_url ? [profile.cover_photo_url] : []}
        />
      </Card>

      {/* Social Links */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-handwriting font-bold text-foreground">
            Social Links
          </h3>
        </div>
        
        {/* Existing links */}
        {socialLinks.length > 0 && (
          <div className="space-y-2 mb-4">
            {socialLinks.map((link) => (
              <motion.div 
                key={link.id} 
                className="flex justify-between items-center p-3 bg-muted rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium capitalize">{link.platform}</span>
                  <span className="text-sm text-muted-foreground ml-2 truncate block sm:inline">
                    {link.url}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSocialLink(link.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add new link */}
        <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-rounded text-foreground mb-2 block">Platform</label>
              <select
                value={newLink.platform}
                onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                <option value="">Select platform...</option>
                {platformOptions.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-rounded text-foreground mb-2 block">URL</label>
              <Input
                placeholder="https://..."
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddSocialLink} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Social Link
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ImageUploader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save } from "lucide-react";

export const AdminSettings = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    location: "",
    hobbies: "",
    profile_picture_url: "",
    cover_photo_url: "",
  });
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [newLink, setNewLink] = useState({ platform: "", url: "" });
  const [isAddingLink, setIsAddingLink] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchSocialLinks();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchSocialLinks = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("profile_id", user.id)
        .order("display_order");

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error("Error fetching social links:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Auto-save profile picture immediately after upload
  const handleProfilePictureUpload = async (urls: string[]) => {
    if (!user || urls.length === 0) return;
    
    const newUrl = urls[0];
    setProfile(prev => ({ ...prev, profile_picture_url: newUrl }));
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ profile_picture_url: newUrl })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile picture saved!");
    } catch (error) {
      console.error("Error saving profile picture:", error);
      toast.error("Failed to save profile picture");
    }
  };

  // Auto-save cover photo immediately after upload
  const handleCoverPhotoUpload = async (urls: string[]) => {
    if (!user || urls.length === 0) return;
    
    const newUrl = urls[0];
    setProfile(prev => ({ ...prev, cover_photo_url: newUrl }));
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ cover_photo_url: newUrl })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Cover photo saved!");
    } catch (error) {
      console.error("Error saving cover photo:", error);
      toast.error("Failed to save cover photo");
    }
  };

  const handleAddSocialLink = async () => {
    if (!user || !newLink.platform || !newLink.url) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate URL
    try {
      new URL(newLink.url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      const { error } = await supabase.from("social_links").insert({
        profile_id: user.id,
        platform: newLink.platform.toLowerCase(),
        url: newLink.url,
        display_order: socialLinks.length,
      });

      if (error) throw error;
      toast.success("Social link added!");
      setNewLink({ platform: "", url: "" });
      setIsAddingLink(false);
      fetchSocialLinks();
    } catch (error) {
      console.error("Error adding social link:", error);
      toast.error("Failed to add social link");
    }
  };

  const handleDeleteSocialLink = async (id: string) => {
    try {
      const { error } = await supabase.from("social_links").delete().eq("id", id);
      if (error) throw error;
      toast.success("Social link deleted!");
      fetchSocialLinks();
    } catch (error) {
      console.error("Error deleting social link:", error);
      toast.error("Failed to delete social link");
    }
  };

  const platformOptions = [
    "instagram", "twitter", "facebook", "linkedin", "github", 
    "youtube", "tiktok", "pinterest", "discord", "website"
  ];

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="p-6">
        <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
          Profile Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-rounded text-foreground mb-2 block">Name</label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="text-sm font-rounded text-foreground mb-2 block">Bio</label>
            <Textarea
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell visitors about yourself..."
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-rounded text-foreground mb-2 block">Location</label>
            <Input
              value={profile.location || ""}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="🌍 Your location"
            />
          </div>
          <div>
            <label className="text-sm font-rounded text-foreground mb-2 block">Hobbies</label>
            <Input
              value={profile.hobbies || ""}
              onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
              placeholder="✨ Your hobbies and interests"
            />
          </div>
          <Button onClick={handleUpdateProfile} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Profile Picture - Auto-saves on upload */}
      <Card className="p-6">
        <h3 className="text-xl font-handwriting font-bold text-foreground mb-2">
          Profile Picture
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a profile picture. It will be saved automatically.
        </p>
        <ImageUploader
          bucket="profile-pictures"
          onUploadComplete={handleProfilePictureUpload}
          maxFiles={1}
          existingImages={profile.profile_picture_url ? [profile.profile_picture_url] : []}
        />
      </Card>

      {/* Cover Photo - Auto-saves on upload */}
      <Card className="p-6">
        <h3 className="text-xl font-handwriting font-bold text-foreground mb-2">
          Cover Photo
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a cover photo for your profile header. It will be saved automatically.
        </p>
        <ImageUploader
          bucket="profile-pictures"
          onUploadComplete={handleCoverPhotoUpload}
          maxFiles={1}
          existingImages={profile.cover_photo_url ? [profile.cover_photo_url] : []}
        />
      </Card>

      {/* Social Links */}
      <Card className="p-6">
        <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
          Social Links
        </h3>
        
        {/* Existing links */}
        {socialLinks.length > 0 && (
          <div className="space-y-2 mb-4">
            {socialLinks.map((link) => (
              <div key={link.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
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
              </div>
            ))}
          </div>
        )}

        {socialLinks.length === 0 && !isAddingLink && (
          <p className="text-muted-foreground text-center py-4 mb-4">
            No social links yet. Add your first link below!
          </p>
        )}

        {!isAddingLink ? (
          <Button onClick={() => setIsAddingLink(true)} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Social Link
          </Button>
        ) : (
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/50">
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
            <div className="flex gap-2">
              <Button onClick={handleAddSocialLink} className="flex-1">
                Add Link
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAddingLink(false);
                setNewLink({ platform: "", url: "" });
              }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

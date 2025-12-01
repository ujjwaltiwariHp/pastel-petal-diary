import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ImageUploader";
import { SocialLinksDisplay } from "@/components/SocialLinksDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const AdminSettings = () => {
  const { user } = useAuth();
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
    }
  };

  const handleProfilePictureUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setProfile({ ...profile, profile_picture_url: urls[0] });
    }
  };

  const handleCoverPhotoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setProfile({ ...profile, cover_photo_url: urls[0] });
    }
  };

  const handleAddSocialLink = async () => {
    if (!user || !newLink.platform || !newLink.url) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase.from("social_links").insert({
        profile_id: user.id,
        platform: newLink.platform,
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
            />
          </div>
          <div>
            <label className="text-sm font-rounded text-foreground mb-2 block">Bio</label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-rounded text-foreground mb-2 block">Location</label>
            <Input
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-rounded text-foreground mb-2 block">Hobbies</label>
            <Input
              value={profile.hobbies}
              onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
            />
          </div>
          <Button onClick={handleUpdateProfile}>Save Changes</Button>
        </div>
      </Card>

      {/* Profile Picture */}
      <Card className="p-6">
        <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
          Profile Picture
        </h3>
        <ImageUploader
          bucket="profile-pictures"
          onUploadComplete={handleProfilePictureUpload}
          maxFiles={1}
          existingImages={profile.profile_picture_url ? [profile.profile_picture_url] : []}
        />
        <Button onClick={handleUpdateProfile} className="mt-4">
          Save Profile Picture
        </Button>
      </Card>

      {/* Cover Photo */}
      <Card className="p-6">
        <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
          Cover Photo
        </h3>
        <ImageUploader
          bucket="profile-pictures"
          onUploadComplete={handleCoverPhotoUpload}
          maxFiles={1}
          existingImages={profile.cover_photo_url ? [profile.cover_photo_url] : []}
        />
        <Button onClick={handleUpdateProfile} className="mt-4">
          Save Cover Photo
        </Button>
      </Card>

      {/* Social Links */}
      <Card className="p-6">
        <h3 className="text-xl font-handwriting font-bold text-foreground mb-4">
          Social Links
        </h3>

        {user && <SocialLinksDisplay profileId={user.id} />}

        {!isAddingLink && (
          <Button onClick={() => setIsAddingLink(true)} className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Social Link
          </Button>
        )}

        {isAddingLink && (
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Platform (e.g., instagram, twitter, github)"
              value={newLink.platform}
              onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
            />
            <Input
              placeholder="URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddSocialLink} className="flex-1">
                Add
              </Button>
              <Button variant="outline" onClick={() => setIsAddingLink(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2 mt-4">
          {socialLinks.map((link) => (
            <div key={link.id} className="flex justify-between items-center p-3 bg-muted rounded">
              <div>
                <span className="font-bold">{link.platform}</span>
                <span className="text-sm text-muted-foreground ml-2">{link.url}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSocialLink(link.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

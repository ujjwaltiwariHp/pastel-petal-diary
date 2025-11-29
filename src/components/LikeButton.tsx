import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface LikeButtonProps {
  postType: "diary" | "travel";
  postId: string;
}

export const LikeButton = ({ postType, postId }: LikeButtonProps) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLikes();
  }, [postId]);

  const fetchLikes = async () => {
    try {
      // Get total likes
      const { count } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_type", postType)
        .eq("post_id", postId);

      setLikes(count || 0);

      // Check if current user has liked
      if (user) {
        const { data } = await supabase
          .from("post_likes")
          .select("id")
          .eq("post_type", postType)
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();

        setHasLiked(!!data);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleLike = async () => {
    setLoading(true);
    try {
      if (hasLiked) {
        // Unlike
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_type", postType)
          .eq("post_id", postId)
          .eq("user_id", user?.id || null);

        setLikes((prev) => prev - 1);
        setHasLiked(false);
      } else {
        // Like
        await supabase.from("post_likes").insert({
          post_type: postType,
          post_id: postId,
          user_id: user?.id || null,
          ip_address: user ? null : "anonymous", // Track anonymous likes
        });

        setLikes((prev) => prev + 1);
        setHasLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className="gap-2"
    >
      <motion.div
        whileTap={{ scale: 1.2 }}
        animate={hasLiked ? { scale: [1, 1.2, 1] } : {}}
      >
        <Heart
          className={`w-4 h-4 ${hasLiked ? "fill-red-500 text-red-500" : ""}`}
        />
      </motion.div>
      <span>{likes}</span>
    </Button>
  );
};

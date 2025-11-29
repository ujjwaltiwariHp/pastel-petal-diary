import { useState, useEffect } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_id: string | null;
  commenter_name: string | null;
  comment_text: string;
  is_hidden: boolean;
  created_at: string;
}

interface CommentSectionProps {
  postType: "diary" | "travel";
  postId: string;
}

export const CommentSection = ({ postType, postId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [postId, showComments]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_type", postType)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user && !commenterName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_type: postType,
        post_id: postId,
        user_id: user?.id || null,
        commenter_name: user ? null : commenterName,
        comment_text: newComment,
      });

      if (error) throw error;

      setNewComment("");
      setCommenterName("");
      await fetchComments();
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      await fetchComments();
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{comments.length} Comments</span>
      </Button>

      {showComments && (
        <div className="space-y-4">
          {/* Comment Form */}
          <Card className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              {!user && (
                <Input
                  placeholder="Your name"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  required
                />
              )}
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                className="min-h-20"
              />
              <Button type="submit" disabled={loading} size="sm">
                <Send className="w-4 h-4 mr-2" />
                Post Comment
              </Button>
            </form>
          </Card>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4 group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-rounded font-semibold text-sm text-foreground mb-1">
                      {comment.commenter_name || "User"}
                    </p>
                    <p className="text-foreground/80 font-rounded">
                      {comment.comment_text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

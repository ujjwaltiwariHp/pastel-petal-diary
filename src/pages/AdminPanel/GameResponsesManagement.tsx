import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface GameResponse {
  id: string;
  question_id: string;
  response_text: string;
  responder_name: string;
  is_read: boolean;
  created_at: string;
  question?: {
    question_text: string;
    question_type: string;
  };
}

export const GameResponsesManagement = () => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<GameResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchResponses();
  }, [user]);

  const fetchResponses = async () => {
    try {
      const { data, error } = await supabase
        .from("game_responses")
        .select(`
          *,
          truth_dare_questions (
            question_text,
            question_type
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedResponses = (data || []).map((r: any) => ({
        ...r,
        question: r.truth_dare_questions,
      }));

      setResponses(formattedResponses);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load responses");
    } finally {
      setLoading(false);
    }
  };

  const toggleRead = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("game_responses")
        .update({ is_read: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      setResponses(responses.map(r => 
        r.id === id ? { ...r, is_read: !currentStatus } : r
      ));
      
      toast.success(currentStatus ? "Marked as unread" : "Marked as read");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from("game_responses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setResponses(responses.filter(r => r.id !== id));
      toast.success("Response deleted");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const unreadCount = responses.filter(r => !r.is_read).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-handwriting font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Game Responses
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              {unreadCount} new
            </span>
          )}
        </h2>
      </div>

      {responses.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-5xl mb-4">🎭</div>
          <p className="text-muted-foreground font-rounded">
            No game responses yet. Share your Truth or Dare link to get responses!
          </p>
        </Card>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {responses.map((response) => (
              <motion.div
                key={response.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className={`p-4 md:p-6 ${!response.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {response.question?.question_type === "truth" ? "💭" : "⚡"}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {response.question?.question_type?.toUpperCase()}
                          </span>
                          {!response.is_read && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {response.question?.question_text}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Response from <span className="font-medium">{response.responder_name}</span>:
                      </p>
                      <p className="text-foreground font-rounded">{response.response_text}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(response.created_at).toLocaleDateString()} at{" "}
                        {new Date(response.created_at).toLocaleTimeString()}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRead(response.id, response.is_read)}
                        >
                          {response.is_read ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(response.id)}
                          disabled={deleting === response.id}
                          className="text-destructive hover:text-destructive"
                        >
                          {deleting === response.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};
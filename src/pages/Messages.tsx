import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send, Trash2 } from "lucide-react";
import FloralDecoration from "@/components/FloralDecoration";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  message: string;
  date: string;
  emoji: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      name: "Sarah",
      message: "Your diary entries are so inspiring! Keep spreading positivity 🌸",
      date: "2024-01-15",
      emoji: "💕",
    },
    {
      id: "2",
      name: "Emma",
      message: "Love your aesthetic! Where did you find that cute stationery?",
      date: "2024-01-14",
      emoji: "✨",
    },
  ]);

  const [newMessage, setNewMessage] = useState({
    name: "",
    message: "",
    emoji: "💕",
  });

  const emojis = ["💕", "✨", "🌸", "🌈", "⭐", "🦋", "🌙", "💫"];

  const handleSendMessage = () => {
    if (!newMessage.name.trim() || !newMessage.message.trim()) {
      toast.error("Please fill in all fields! 🌸");
      return;
    }

    setMessages([
      {
        id: Date.now().toString(),
        ...newMessage,
        date: new Date().toISOString(),
      },
      ...messages,
    ]);

    setNewMessage({ name: "", message: "", emoji: "💕" });
    toast.success("Message sent! 💌");
  };

  const handleDelete = (id: string) => {
    setMessages(messages.filter((m) => m.id !== id));
    toast.success("Message deleted 🗑️");
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20 px-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="relative mb-8">
          <h1 className="text-4xl md:text-5xl font-handwriting font-bold text-center text-foreground mb-2">
            Message Box 💌
          </h1>
          <p className="text-center text-muted-foreground font-rounded">
            Leave a sweet message and brighten my day!
          </p>
          <FloralDecoration variant="top-right" className="hidden md:block" />
        </div>

        {/* Send Message Form */}
        <Card className="p-6 mb-8 shadow-card bg-gradient-to-br from-accent/10 to-primary/10">
          <h3 className="text-xl font-handwriting font-bold text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            Send a Message
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-rounded text-foreground mb-2 block">
                Your Name
              </label>
              <Input
                value={newMessage.name}
                onChange={(e) => setNewMessage({ ...newMessage, name: e.target.value })}
                placeholder="Enter your name..."
                className="font-rounded"
              />
            </div>

            <div>
              <label className="text-sm font-rounded text-foreground mb-2 block">
                Pick an emoji
              </label>
              <div className="flex gap-2 flex-wrap">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant={newMessage.emoji === emoji ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewMessage({ ...newMessage, emoji })}
                    className="text-2xl"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-rounded text-foreground mb-2 block">
                Your Message
              </label>
              <Textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                placeholder="Write something nice..."
                className="min-h-24 font-rounded"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </Card>

        {/* Messages List */}
        <div>
          <h2 className="text-2xl font-handwriting font-bold text-foreground mb-4">
            Messages ({messages.length})
          </h2>
          <div className="space-y-4">
            {messages.map((msg) => (
              <Card
                key={msg.id}
                className="p-6 shadow-card hover:shadow-soft transition-all bg-card/95 backdrop-blur-sm relative group"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(msg.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div className="flex items-start gap-4">
                  <div className="text-4xl">{msg.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-handwriting font-bold text-lg text-foreground">
                        {msg.name}
                      </h4>
                      <span className="text-xs text-muted-foreground font-rounded">
                        {new Date(msg.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground/80 font-rounded leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

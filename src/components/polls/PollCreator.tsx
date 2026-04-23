"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreatePoll } from "@/hooks/usePolls";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Loader2 } from "lucide-react";

interface PollCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PollCreator({ open, onOpenChange }: PollCreatorProps) {
  const router = useRouter();
  const createPoll = useCreatePoll();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, _setAllowMultiple] = useState(false);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim());

    if (!question.trim() || validOptions.length < 2) return;

    try {
      const _poll = await createPoll.mutateAsync({
        title: question,
        question: question,
        options: validOptions.map((text) => text),
        pollType: allowMultiple ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE",
        allowChangeVote: allowMultiple,
      });
      onOpenChange(false);
      router.push(`/polls`);
    } catch (error) {
      console.error("Failed to create poll:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Poll</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
            />
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              <Plus className="mr-1 h-4 w-4" />
              Add Option
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPoll.isPending || !question.trim() || options.filter((o) => o.trim()).length < 2}
            >
              {createPoll.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Poll
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

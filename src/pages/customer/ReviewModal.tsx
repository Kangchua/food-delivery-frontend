import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { ReviewUpdateDto } from "@/types/review.page";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: ReviewUpdateDto;
  onSubmit: (data: ReviewUpdateDto) => Promise<void>;
}

export default function ReviewModal({
  open,
  onClose,
  initialData,
  onSubmit,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setComment(initialData.comment || "");
    } else {
      setRating(5);
      setComment("");
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({ rating, comment });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Sửa đánh giá" : "Viết đánh giá"}
          </DialogTitle>
        </DialogHeader>

        {/* STAR */}
        <div className="flex justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)}>
              <Star
                className={
                  s <= rating
                    ? "w-7 h-7 fill-yellow-400 text-yellow-400"
                    : "w-7 h-7 text-muted-foreground"
                }
              />
            </button>
          ))}
        </div>

        {/* COMMENT */}
        <textarea
          className="w-full min-h-[100px] rounded-md border p-3 text-sm"
          placeholder="Nhận xét của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang gửi..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
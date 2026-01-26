import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (inputValue?: string) => void;
  title: string;
  description: string;
  showInput?: boolean; // Trường true/false để xuất hiện ô nhập
  inputPlaceholder?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  showInput = false,
  inputPlaceholder = "Nhập nội dung...",
}) => {
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    onConfirm(showInput ? value : undefined);
    setValue(""); // Reset input sau khi xác nhận
    onClose();
  };

  const handleCancel = () => {
    setValue("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {showInput && (
          <div className="py-4">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={inputPlaceholder}
              className="rounded-xl"
            />
          </div>
        )}

        <DialogFooter className="flex flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-full flex-1 sm:flex-none"
          >
            Thoát
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            className="rounded-full flex-1 sm:flex-none"
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState } from "react";
import { useTasks } from "@/contexts/TasksContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BatchCreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TaskInput {
  title: string;
  description: string;
}

const BatchCreateTaskDialog: React.FC<BatchCreateTaskDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addTask } = useTasks();
  const { toast } = useToast();
  const [taskInput, setTaskInput] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [registrationDeadline, setRegistrationDeadline] = useState<Date>(new Date());
  const [hours, setHours] = useState<string>("1");
  const [minutes, setMinutes] = useState<string>("0");

  const handleSubmit = () => {
    if (!taskInput.trim()) {
      toast({
        title: "錯誤",
        description: "請輸入至少一個任務資訊",
        variant: "destructive",
      });
      return;
    }

    const tasks = parseTaskInput(taskInput);
    if (tasks.length === 0) {
      toast({
        title: "錯誤",
        description: "無法解析任務輸入，請確保每行包含標題和描述（用|分隔）",
        variant: "destructive",
      });
      return;
    }

    // 批量创建任务
    tasks.forEach((task) => {
      addTask({
        title: task.title,
        description: task.description,
        startDate: startDate,
        endDate: startDate, // 使用相同的开始日期作为结束日期
        registrationDeadline: registrationDeadline,
        duration: {
          hours: parseInt(hours) || 1,
          minutes: parseInt(minutes) || 0,
        },
      });
    });

    // 重置表单并关闭对话框
    setTaskInput("");
    onOpenChange(false);

    toast({
      title: "批量創建成功",
      description: `已成功創建 ${tasks.length} 個任務`,
    });
  };

  // 解析任务输入
  const parseTaskInput = (input: string): TaskInput[] => {
    const lines = input.split("\n").filter((line) => line.trim());
    
    return lines.map((line) => {
      const [title, description] = line.split("|").map((part) => part.trim());
      return {
        title: title || "未命名任務",
        description: description || "",
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>批量創建任務</DialogTitle>
          <DialogDescription>
            每行輸入一個任務，格式為"任務標題|任務描述"。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="taskInput">任務列表</Label>
            <Textarea
              id="taskInput"
              placeholder="任務標題1|任務描述1&#10;任務標題2|任務描述2&#10;任務標題3|任務描述3"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="min-h-[150px]"
            />
            <p className="text-sm text-muted-foreground">
              每行一個任務，用 | 分隔標題和描述
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>開始日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "選擇日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => setStartDate(date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>報名截止日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !registrationDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {registrationDeadline
                      ? format(registrationDeadline, "PPP")
                      : "選擇日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={registrationDeadline}
                    onSelect={(date) =>
                      setRegistrationDeadline(date || new Date())
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="hours">時長（小時）</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minutes">時長（分鐘）</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button onClick={handleSubmit}>創建任務</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchCreateTaskDialog;

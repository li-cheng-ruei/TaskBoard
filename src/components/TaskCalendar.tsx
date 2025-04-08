
import React, { useState } from "react";
import { useTasks } from "@/contexts/TasksContext";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskList from "./TaskList";

const TaskCalendar = () => {
  const { tasks, getTasksByDate } = useTasks();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to get unique dates that have tasks
  const getTaskDates = () => {
    const uniqueDates = new Set<string>();
    tasks.forEach((task) => {
      const dateStr = format(task.startDate, "yyyy-MM-dd");
      uniqueDates.add(dateStr);
    });
    return Array.from(uniqueDates).map((dateStr) => new Date(dateStr));
  };

  // Function to count tasks per day
  const getTaskCountByDate = () => {
    const taskCounts: Record<string, number> = {};
    tasks.forEach((task) => {
      const dateStr = format(task.startDate, "yyyy-MM-dd");
      taskCounts[dateStr] = (taskCounts[dateStr] || 0) + 1;
    });
    return taskCounts;
  };

  // Function to handle day click
  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    const tasksOnDay = getTasksByDate(date);
    
    if (tasksOnDay.length > 0) {
      setIsDialogOpen(true);
    }
  };

  const taskDates = getTaskDates();
  const taskCountsByDate = getTaskCountByDate();

  return (
    <div className="h-full w-full flex flex-col">
      <Card className="flex-1 p-0 w-full mx-auto overflow-hidden">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDayClick}
          className="h-full w-full max-w-none"
          modifiers={{
            hasTask: taskDates,
          }}
          modifiersStyles={{
            hasTask: {
              fontWeight: "bold",
              backgroundColor: "hsl(var(--primary) / 0.1)",
              borderRadius: "0.25rem",
            },
          }}
          components={{
            DayContent: (props) => {
              const dateStr = format(props.date, "yyyy-MM-dd");
              const taskCount = taskCountsByDate[dateStr] || 0;
              const isTaskDate = taskCount > 0;

              return (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center h-full w-full",
                    isTaskDate && "relative"
                  )}
                >
                  <div className="mb-1">{props.date.getDate()}</div>
                  {isTaskDate && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                        <span 
                          key={i} 
                          className="w-1.5 h-1.5 bg-primary rounded-full" 
                          title={`${taskCount} 個任務`}
                        />
                      ))}
                      {taskCount > 3 && (
                        <span className="text-[0.6rem] text-primary ml-0.5">+{taskCount - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(selectedDate, "MMM d") : ""} 的任務
            </DialogTitle>
          </DialogHeader>
          {selectedDate && <TaskList tasks={getTasksByDate(selectedDate)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskCalendar;

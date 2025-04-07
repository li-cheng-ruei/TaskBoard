
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
              const isTaskDate = taskDates.some((date) =>
                isSameDay(date, props.date)
              );

              return (
                <div
                  className={cn(
                    "flex items-center justify-center h-full w-full",
                    isTaskDate && "relative"
                  )}
                >
                  {props.date.getDate()}
                  {isTaskDate && (
                    <span className="absolute bottom-0 w-1 h-1 bg-primary rounded-full"></span>
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
              Tasks for {selectedDate ? format(selectedDate, "MMM d") : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedDate && <TaskList tasks={getTasksByDate(selectedDate)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskCalendar;

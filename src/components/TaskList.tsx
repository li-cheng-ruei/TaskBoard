
import React from "react";
import { useTasks } from "@/contexts/TasksContext";
import { useAuth } from "@/contexts/AuthContext";
import { Task } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, CheckCircle, XCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import TaskActions from "./TaskActions";

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const { user } = useAuth();
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No Tasks Available</h3>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'manager' 
            ? 'Create a new task to get started' 
            : 'No tasks are currently available for registration'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const isRegistered = task.registeredEmployees.includes(user?.id || '');
  const isAssigned = task.assignedTo === user?.id;
  
  let statusClass = '';
  if (task.status === 'pending') {
    statusClass = 'task-pending';
  } else if (task.status === 'assigned') {
    statusClass = 'task-assigned';
  } else {
    statusClass = 'task-completed';
  }

  const getStatusBadge = () => {
    switch (task.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-task-pending/10 text-task-pending border-task-pending">Pending</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="bg-task-assigned/10 text-task-assigned border-task-assigned">Assigned</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-task-completed/10 text-task-completed border-task-completed">Completed</Badge>;
    }
  };

  return (
    <Card className={cn("overflow-hidden", statusClass)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{task.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>
            {format(task.startDate, "PPP")} - {format(task.endDate, "PPP")}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Registration Deadline: {format(task.registrationDeadline, "PPP")}</span>
        </div>
        {(isEmployee || user?.role === 'manager') && (
          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Registered: {task.registeredEmployees.length}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <TaskActions task={task} />
      </CardFooter>
    </Card>
  );
};

export default TaskList;


import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TasksContext";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { CheckCircle, Edit, Trash, XCircle } from "lucide-react";
import { isBefore } from "date-fns";
import EditTaskDialog from "./EditTaskDialog";

interface TaskActionsProps {
  task: Task;
}

const TaskActions: React.FC<TaskActionsProps> = ({ task }) => {
  const { user } = useAuth();
  const { registerForTask, unregisterFromTask, deleteTask, updateTask } = useTasks();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';
  
  const isRegistered = task.registeredEmployees.includes(user?.id || '');
  const isAssigned = task.assignedTo === user?.id;
  
  const isDeadlinePassed = isBefore(task.registrationDeadline, new Date());
  const canRegister = !isDeadlinePassed && task.status === 'pending';
  
  const handleCompleteTask = () => {
    updateTask(task.id, { status: 'completed' });
  };
  
  if (isManager && task.createdBy === user?.id) {
    return (
      <div className="flex gap-2 w-full">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => setOpenEditDialog(true)}
        >
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex-1"
          onClick={() => setOpenDeleteDialog(true)}
        >
          <Trash className="h-4 w-4 mr-2" /> Delete
        </Button>
        
        {/* Edit Dialog */}
        <EditTaskDialog 
          task={task} 
          open={openEditDialog} 
          onOpenChange={setOpenEditDialog} 
        />
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the task and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteTask(task.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
  
  if (isEmployee) {
    if (isAssigned) {
      return (
        <div className="w-full">
          {task.status === 'assigned' ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleCompleteTask}
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Mark as Completed
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground w-full text-center py-1">
              Task completed
            </div>
          )}
        </div>
      );
    }
    
    if (canRegister) {
      return (
        <div className="w-full">
          {isRegistered ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => unregisterFromTask(task.id)}
            >
              <XCircle className="h-4 w-4 mr-2" /> Cancel Registration
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full"
              onClick={() => registerForTask(task.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Register
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <div className="text-sm text-muted-foreground w-full text-center py-1">
        {isRegistered 
          ? "Waiting for assignment" 
          : "Registration deadline has passed"}
      </div>
    );
  }
  
  return null;
};

export default TaskActions;

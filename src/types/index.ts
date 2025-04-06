
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee';
  facility?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  createdBy: string;
  status: 'pending' | 'assigned' | 'completed';
  assignedTo?: string;
  registeredEmployees: string[];
}

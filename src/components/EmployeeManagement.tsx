
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

const EmployeeManagement = () => {
  const { allUsers, updateUserRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Filter employees (exclude the current user if they are a manager)
  const employees = allUsers.filter((user) => user.role === "employee" || user.role === "manager");
  
  // Handle search functionality
  const filteredEmployees = searchQuery 
    ? employees.filter(
        (employee) => 
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (employee.facility && employee.facility.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : employees;

  // Handle role change
  const handleRoleChange = (userId: string, newRole: "manager" | "employee") => {
    updateUserRole(userId, newRole);
    
    toast({
      title: "Role Updated",
      description: `User role has been updated successfully.`,
      duration: 3000,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Employee Management</CardTitle>
          <div className="relative w-full md:w-64">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.facility || "-"}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={employee.role}
                        onValueChange={(value) => 
                          handleRoleChange(employee.id, value as "manager" | "employee")
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeManagement;

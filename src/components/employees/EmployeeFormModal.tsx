"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Employee, SelectOption, Skill } from "@/types/employees";

// =============================================================================
// Color Palette
// =============================================================================

// Default color for employees (color picker removed per design decision)
const DEFAULT_EMPLOYEE_COLOR = "#3b82f6"; // blue

// =============================================================================
// Props
// =============================================================================

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
  roles?: SelectOption[];
  skillOptions?: SelectOption[];
  onSubmit?: (data: Omit<Employee, "id" | "availability" | "assignments">) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function EmployeeFormModal({
  open,
  onOpenChange,
  employee,
  roles = [],
  skillOptions = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: EmployeeFormModalProps) {
  const isEditing = !!employee;

  // Form state
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<Employee["role"]>("uitvoerder");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [hourlyRate, setHourlyRate] = React.useState(0);
  const [weeklyCapacity, setWeeklyCapacity] = React.useState(40);
  const [skills, setSkills] = React.useState<Skill[]>([]);
  const [color, setColor] = React.useState(DEFAULT_EMPLOYEE_COLOR);
  const [isActive, setIsActive] = React.useState(true);

  // Validation state
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form when modal opens/closes or employee changes
  React.useEffect(() => {
    if (open) {
      if (employee) {
        setName(employee.name);
        setRole(employee.role);
        setEmail(employee.email);
        setPhone(employee.phone);
        setHourlyRate(employee.hourlyRate);
        setWeeklyCapacity(employee.weeklyCapacity);
        setSkills([...employee.skills]);
        setColor(employee.color);
        setIsActive(employee.isActive);
      } else {
        setName("");
        setRole("uitvoerder");
        setEmail("");
        setPhone("");
        setHourlyRate(0);
        setWeeklyCapacity(40);
        setSkills([]);
        setColor(DEFAULT_EMPLOYEE_COLOR);
        setIsActive(true);
      }
      setErrors({});
    }
  }, [open, employee]);

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Naam is verplicht";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ongeldig e-mailadres";
    }

    if (hourlyRate < 0) {
      newErrors.hourlyRate = "Uurtarief kan niet negatief zijn";
    }

    if (weeklyCapacity < 0 || weeklyCapacity > 168) {
      newErrors.weeklyCapacity = "Weekcapaciteit moet tussen 0 en 168 uur liggen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit?.({
      name: name.trim(),
      role,
      email: email.trim(),
      phone: phone.trim(),
      hourlyRate,
      weeklyCapacity,
      skills,
      color,
      isActive,
    });
  }

  function handleCancel() {
    onCancel?.();
    onOpenChange(false);
  }

  function toggleSkill(skill: Skill) {
    setSkills((current) =>
      current.includes(skill)
        ? current.filter((s) => s !== skill)
        : [...current, skill]
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Medewerker Bewerken" : "Nieuwe Medewerker"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Pas de gegevens van de medewerker aan."
              : "Vul de gegevens in om een nieuwe medewerker toe te voegen."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Naam <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Voornaam Achternaam"
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Employee["role"])}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@voorbeeld.nl"
                className={errors.email ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefoon</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06-12345678"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Hourly Rate and Weekly Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Uurtarief</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  &euro;
                </span>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                  className={cn("pl-7", errors.hourlyRate ? "border-red-500" : "")}
                  disabled={isLoading}
                />
              </div>
              {errors.hourlyRate && (
                <p className="text-xs text-red-500">{errors.hourlyRate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyCapacity">Weekcapaciteit (uren)</Label>
              <Input
                id="weeklyCapacity"
                type="number"
                min="0"
                max="168"
                value={weeklyCapacity}
                onChange={(e) => setWeeklyCapacity(parseInt(e.target.value) || 0)}
                className={errors.weeklyCapacity ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.weeklyCapacity && (
                <p className="text-xs text-red-500">{errors.weeklyCapacity}</p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Vaardigheden</Label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <Badge
                  key={skill.value}
                  variant={skills.includes(skill.value as Skill) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    skills.includes(skill.value as Skill)
                      ? ""
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  onClick={() => !isLoading && toggleSkill(skill.value as Skill)}
                >
                  {skill.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active Status (only for editing) */}
          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
                disabled={isLoading}
                aria-describedby="isActive-description"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Actief
              </Label>
              <span id="isActive-description" className="sr-only">
                Schakel in om de medewerker actief te maken
              </span>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Bezig...
                </span>
              ) : isEditing ? (
                "Opslaan"
              ) : (
                "Toevoegen"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

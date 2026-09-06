/**
 * Form Validation Schemas
 * Reference: Skill+ Master Product Blueprint v1.0
 *
 * Single schema source shared between React Hook Form validation
 * and API response parsing (per Part IV §IV.6).
 * Validation timing: on-blur (Design Spec §D.4).
 */

import { z } from "zod";

// ============================================================
// Login Schema
// ============================================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================
// Signup Schema
// ============================================================
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be under 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// ============================================================
// Career Profile Schema
// ============================================================
export const experienceLevelEnum = z.enum([
  "junior",
  "mid",
  "senior",
  "staff",
  "principal",
  "lead",
]);

export const careerProfileSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be under 100 characters"),
  currentRole: z
    .string()
    .min(1, "Current role is required")
    .max(100, "Role must be under 100 characters"),
  targetRole: z
    .string()
    .min(1, "Target role is required")
    .max(100, "Role must be under 100 characters"),
  yearsOfExperience: z
    .number({ message: "Years of experience is required" })
    .min(0, "Must be at least 0 years")
    .max(50, "Must be under 50 years"),
  experienceLevel: experienceLevelEnum,
  careerPath: z.string().max(200, "Career path must be under 200 characters").optional(),
  careerGoals: z
    .array(z.string())
    .min(1, "Select at least one career goal")
    .max(5, "Select up to 5 career goals"),
});

export type CareerProfileFormData = z.infer<typeof careerProfileSchema>;

// ============================================================
// GitHub Source Schema
// ============================================================
export const githubSourceSchema = z.object({
  username: z
    .string()
    .min(1, "GitHub username is required")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "Invalid GitHub username format",
    ),
  includePrivate: z.boolean().default(false),
});

export type GithubSourceFormData = z.infer<typeof githubSourceSchema>;

// ============================================================
// Career Goal Options (for multi-select)
// ============================================================
export const CAREER_GOALS = [
  { id: "backend-mastery", label: "Deepen backend expertise" },
  { id: "frontend-mastery", label: "Master frontend engineering" },
  { id: "fullstack", label: "Become a full-stack engineer" },
  { id: "architecture", label: "Move into system architecture" },
  { id: "tech-lead", label: "Grow into a tech lead role" },
  { id: "staff-eng", label: "Advance to staff engineer" },
  { id: "devops", label: "Strengthen DevOps skills" },
  { id: "data-eng", label: "Explore data engineering" },
  { id: "ai-ml", label: "Learn AI/ML engineering" },
  { id: "open-source", label: "Contribute to open source" },
] as const;

// ============================================================
// Experience Level Options (for select)
// ============================================================
export const EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-level (2-5 years)" },
  { value: "senior", label: "Senior (5-8 years)" },
  { value: "staff", label: "Staff (8-12 years)" },
  { value: "lead", label: "Engineering Lead" },
  { value: "principal", label: "Principal (12+ years)" },
] as const;

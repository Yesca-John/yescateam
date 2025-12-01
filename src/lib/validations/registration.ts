// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */


// Registration Form Validation Schema
import * as z from 'zod';

export const registrationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  gender: z.enum(['M', 'F'], { required_error: 'Please select gender' }),
  age: z.number().min(15, 'Age must be at least 15 years').max(40, 'Age must not exceed 40 years'),
  dob: z.string().optional(),
  believer: z.enum(['yes', 'no'], { required_error: 'Please select believer status' }),
  church_name: z.string().min(2, 'Church name is required'),
  address: z.string().min(3, 'Address is required'),
  fathername: z.string().optional(),
  marriage_status: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  baptism_date: z.string().optional(),
  camp_participated_since: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  future_goals: z.string().optional(),
  current_skills: z.string().optional(),
  desired_skills: z.string().optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

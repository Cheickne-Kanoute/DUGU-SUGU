import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Nom trop court').max(100),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Numéro invalide').optional().or(z.literal('')),
  password: z.string().min(6, 'Minimum 6 caractères'), // Simplified for demo to match previous logic
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const productSchema = z.object({
  name: z.string().min(2, 'Le nom est trop court').max(200),
  description: z.string().min(10, 'La description doit faire au moins 10 caractères').max(2000),
  price: z.number().min(0, 'Le prix ne peut pas être négatif').max(10000000),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
  category_id: z.string().min(1, 'Catégorie requise'),
  unit: z.string().min(1, 'Unité requise'),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Le nom est trop court').max(100),
  phone: z.string().optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
});

export const sellerRequestSchema = z.object({
  message: z.string().min(20, 'Décrivez votre activité (20 caractères min)').max(1000),
});

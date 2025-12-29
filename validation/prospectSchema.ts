import { z } from 'zod';
import { ServiceType, ContactMethod } from '../types';

// Base prospect schema with common fields (without refinements)
const prospectBaseSchemaWithoutRefinement = z.object({
    prospectName: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),

    email: z.string()
        .email('Invalid email address')
        .optional()
        .or(z.literal('')),

    phone: z.string()
        .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
        .optional()
        .or(z.literal('')),

    contactMethod: z.nativeEnum(ContactMethod),

    dateOfContact: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),

    notes: z.string()
        .max(1000, 'Notes must be less than 1000 characters')
        .optional()
        .or(z.literal('')),

    serviceInterestedIn: z.nativeEnum(ServiceType),
});

// Language Training schema
export const languageTrainingSchema = prospectBaseSchemaWithoutRefinement.extend({
    serviceInterestedIn: z.literal(ServiceType.LanguageTraining),
    trainingLanguages: z.array(z.string())
        .min(1, 'Please select at least one language'),
    translationSourceLanguage: z.string().optional(),
    translationTargetLanguage: z.string().optional(),
    interpretationSourceLanguage: z.string().optional(),
    interpretationTargetLanguage: z.string().optional(),
}).refine(
    (data) => data.email || data.phone,
    {
        message: 'Either email or phone is required',
        path: ['email'],
    }
);

// Translation schema
export const translationSchema = prospectBaseSchemaWithoutRefinement.extend({
    serviceInterestedIn: z.literal(ServiceType.DocTranslation),
    translationSourceLanguage: z.string()
        .min(1, 'Source language is required'),
    translationTargetLanguage: z.string()
        .min(1, 'Target language is required'),
    trainingLanguages: z.array(z.string()).optional(),
    interpretationSourceLanguage: z.string().optional(),
    interpretationTargetLanguage: z.string().optional(),
}).refine(
    (data) => data.email || data.phone,
    {
        message: 'Either email or phone is required',
        path: ['email'],
    }
).refine(
    (data) => data.translationSourceLanguage !== data.translationTargetLanguage,
    {
        message: 'Source and target languages must be different',
        path: ['translationTargetLanguage'],
    }
);

// Interpretation schema
export const interpretationSchema = prospectBaseSchemaWithoutRefinement.extend({
    serviceInterestedIn: z.literal(ServiceType.Interpretation),
    interpretationSourceLanguage: z.string()
        .min(1, 'Source language is required'),
    interpretationTargetLanguage: z.string()
        .min(1, 'Target language is required'),
    trainingLanguages: z.array(z.string()).optional(),
    translationSourceLanguage: z.string().optional(),
    translationTargetLanguage: z.string().optional(),
}).refine(
    (data) => data.email || data.phone,
    {
        message: 'Either email or phone is required',
        path: ['email'],
    }
).refine(
    (data) => data.interpretationSourceLanguage !== data.interpretationTargetLanguage,
    {
        message: 'Source and target languages must be different',
        path: ['interpretationTargetLanguage'],
    }
);

// Discriminated union based on service type
export const prospectFormSchema = z.discriminatedUnion('serviceInterestedIn', [
    languageTrainingSchema,
    translationSchema,
    interpretationSchema,
]);

export type ProspectFormValidation = z.infer<typeof prospectFormSchema>;

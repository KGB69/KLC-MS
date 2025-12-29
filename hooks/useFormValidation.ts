import { useState } from 'react';
import { z } from 'zod';

interface ValidationErrors {
    [key: string]: string;
}

export function useFormValidation<T extends z.ZodType>(schema: T) {
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateField = (name: string, value: any): boolean => {
        try {
            // For discriminated unions, we need to validate the entire form
            // to get proper field-level errors
            return true; // Skip individual field validation for now
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(prev => ({
                    ...prev,
                    [name]: error.issues[0].message
                }));
                return false;
            }
            return true;
        }
    };

    const validateForm = (data: any): boolean => {
        try {
            schema.parse(data);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: ValidationErrors = {};
                error.issues.forEach(issue => {
                    const path = issue.path.join('.');
                    if (path) {
                        newErrors[path] = issue.message;
                    }
                });
                setErrors(newErrors);
                return false;
            }
            return false;
        }
    };

    const clearErrors = () => setErrors({});

    const clearFieldError = (name: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    return {
        errors,
        validateField,
        validateForm,
        clearErrors,
        clearFieldError,
    };
}

// src/pages/Procurement/UserPasswordPage.tsx

import React, { useState, useCallback } from 'react';
import { Key, Eye, EyeOff, Lock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

interface UserPasswordPageProps {
    UserData: {
        id?: string | number;
        first_name?: string;
        last_name?: string;
        email?: string;
    };
    onClose?: () => void;
    onSave?: () => void;
    onUpdatePassword?: (data: {
        id: string | number;
        new_password: string;
    }) => Promise<any>;
    onForceReset?: (data: {
        id: string | number;
        force_reset: boolean;
    }) => Promise<any>;
    isLoading?: boolean;
}

const UserPasswordPage: React.FC<UserPasswordPageProps> = ({ 
    UserData, 
    onClose,
    onSave,
    onUpdatePassword,
    onForceReset,
    isLoading = false
}) => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        new_password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Password strength validation
    const validatePassword = useCallback((password: string) => {
        const errors: string[] = [];
        if (password.length < 8) errors.push('At least 8 characters');
        if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
        if (!/[0-9]/.test(password)) errors.push('At least one number');
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('At least one special character');
        return errors;
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.new_password) {
            newErrors.new_password = 'New password is required';
        } else {
            const passwordErrors = validatePassword(formData.new_password);
            if (passwordErrors.length > 0) {
                newErrors.new_password = passwordErrors.join(', ');
            }
        }

        if (!formData.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password';
        } else if (formData.new_password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, validatePassword]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        if (!onUpdatePassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Update password function not provided',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            onUpdatePassword({
                id: UserData?.id || '',
                new_password: formData.new_password,
            });

            
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.message || 'An error occurred while updating password.',
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, UserData, onUpdatePassword, onSave, onClose, validateForm]);

    const handleForceReset = useCallback(async () => {
        if (!onForceReset) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Force reset function not provided',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Force Password Reset?',
            text: `This will force ${UserData?.first_name} ${UserData?.last_name} to reset their password on next login.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, force reset',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await onForceReset({
                    id: UserData?.id || '',
                    force_reset: true,
                });

                if (response?.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Password Reset Forced',
                        text: 'User will be required to reset their password on next login.',
                        timer: 3000,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response?.message || 'Failed to force password reset.',
                    });
                }
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.message || 'Failed to force password reset.',
                });
            }
        }
    }, [UserData, onForceReset]);

    const userFullName = `${UserData?.first_name || ''} ${UserData?.last_name || ''}`.trim();
    const isProcessing = isSubmitting || isLoading;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Key className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Password Manager
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage password for {userFullName || 'User'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        {UserData?.email || 'No email'}
                    </span>
                </div>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                                errors.new_password 
                                    ? 'border-red-500 dark:border-red-500' 
                                    : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors`}
                            placeholder="Enter new password"
                            disabled={isProcessing}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.new_password && (
                        <p className="mt-1 text-sm text-red-500">{errors.new_password}</p>
                    )}
                    
                    {/* Password Requirements */}
                    {formData.new_password && (
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Password requirements:</p>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                {[
                                    { label: '8+ characters', check: formData.new_password.length >= 8 },
                                    { label: 'Uppercase letter', check: /[A-Z]/.test(formData.new_password) },
                                    { label: 'Lowercase letter', check: /[a-z]/.test(formData.new_password) },
                                    { label: 'Number', check: /[0-9]/.test(formData.new_password) },
                                    { label: 'Special character', check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password) },
                                ].map((req, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                        {req.check ? (
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <XCircle className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                                        )}
                                        <span className={req.check ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                                errors.confirm_password 
                                    ? 'border-red-500 dark:border-red-500' 
                                    : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors`}
                            placeholder="Confirm new password"
                            disabled={isProcessing}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirm_password && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                Update Password
                            </>
                        )}
                    </button>
                    
                    {onForceReset && (
                        <button
                            type="button"
                            onClick={handleForceReset}
                            disabled={isProcessing}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Force Reset
                        </button>
                    )}
                    
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {/* Security Tips */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Security Tips</h3>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Use a unique password that you don't use for other accounts</li>
                    <li>Include a mix of uppercase, lowercase, numbers, and special characters</li>
                    <li>Avoid using personal information like your name or birthdate</li>
                    <li>Change your password regularly for better security</li>
                </ul>
            </div>
        </div>
    );
};

export default UserPasswordPage;
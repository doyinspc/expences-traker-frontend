// src/pages/Company/CompanyFileUpload.tsx

import React, { useState, useCallback, useRef } from 'react';
import { Camera, Upload, X, User, Trash2, RefreshCw, Image, FileImage, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { SERVER_URL } from '../../actions/common';

interface CompanyFileUploadProps {
    /** The company record (must have an `id`) */
    companyData: {
        id?: string | number;
        [key: string]: any; // additional fields like logo_path, favicon_path, etc.
    };
    /** The database column to update (e.g., 'logo_path', 'favicon_path') */
    fieldName: string;
    /** Human-readable label for the file (e.g., 'Logo', 'Favicon') */
    fieldLabel: string;
    /** Optional URL of the current file (if not provided, will look in companyData[fieldName]) */
    currentFileUrl?: string;
    /** Callback to upload the file */
    onUploadFile?: (data: FormData) => Promise<any>;
    /** Callback to remove the file */
    onRemoveFile?: (data: { id: string | number; photo: null; field: string }) => Promise<any>;
    /** Optional close callback */
    onClose?: () => void;
    /** Optional save callback after success */
    onSave?: () => void;
    /** Loading state from parent */
    isLoading?: boolean;
}

const CompanyFileUpload: React.FC<CompanyFileUploadProps> = ({
    companyData,
    fieldName,
    fieldLabel,
    currentFileUrl,
    onUploadFile,
    onRemoveFile,
    onClose,
    onSave,
    isLoading = false,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Determine the current file URL (use prop if provided, else from companyData)
    const fileUrl = currentFileUrl ?? companyData?.[fieldName] ?? null;
    const companyName = companyData?.name || 'Company';

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File Type',
                text: `Please select a valid image file (JPEG, PNG, GIF, WEBP, or SVG)`,
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'File Too Large',
                text: 'Please select an image under 5MB',
            });
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleUpload = useCallback(async () => {
        if (!selectedFile) {
            Swal.fire({
                icon: 'warning',
                title: 'No File Selected',
                text: `Please select a ${fieldLabel.toLowerCase()} to upload`,
            });
            return;
        }

        if (!onUploadFile) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Upload function not provided',
            });
            return;
        }

        setIsUploading(true);

        try {
            // Prepare FormData – the backend expects:
            //   - id: company ID
            //   - field: the column name (e.g., 'logo_path')
            //   - photo: the actual file
            const formData = new FormData();
            formData.append('id', String(companyData.id));
            formData.append('field', fieldName);
            formData.append('photo', selectedFile);

            await onUploadFile(formData);

            // If onSave is provided, call it to refresh data
            if (onSave) onSave();

            // Reset local state after success
            setSelectedFile(null);
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Upload Error',
                text: error?.message || `Failed to upload ${fieldLabel.toLowerCase()}.`,
            });
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, companyData.id, fieldName, onUploadFile, onSave, fieldLabel]);

    const handleRemoveFile = useCallback(async () => {
        if (!onRemoveFile) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Remove function not provided',
            });
            return;
        }

        const result = await Swal.fire({
            title: `Remove ${fieldLabel}?`,
            text: `This will remove the ${fieldLabel.toLowerCase()} for ${companyName}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                const response = await onRemoveFile({
                    id: companyData.id,
                    photo: null,
                    field: fieldName,
                });

                if (response?.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Removed',
                        text: `${fieldLabel} has been removed successfully.`,
                        timer: 3000,
                        showConfirmButton: false,
                    });

                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }

                    if (onSave) onSave();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response?.message || `Failed to remove ${fieldLabel.toLowerCase()}.`,
                    });
                }
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error?.message || `Failed to remove ${fieldLabel.toLowerCase()}.`,
                });
            }
        }
    }, [companyData.id, companyName, fieldName, fieldLabel, onRemoveFile, onSave]);

    const handleCancel = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onClose) onClose();
    }, [onClose]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file) {
            const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileSelect(event);
        }
    }, [handleFileSelect]);

    const isProcessing = isUploading || isLoading;

    return (
        <div className="space-y-6">
            {/* Header with Back button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <FileImage className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {fieldLabel}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage {fieldLabel.toLowerCase()} for {companyName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        {companyData?.name || 'Company'}
                    </span>
                </div>
            </div>

            {/* File Preview */}
            <div className="flex flex-col items-center">
                <div
                    className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-gray-200 dark:border-gray-600"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : fileUrl ? (
                        <img src={SERVER_URL + fileUrl} alt={`${fieldLabel}`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-20 h-20 text-gray-400" />
                        </div>
                    )}

                    {!previewUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                            <div className="text-center text-white">
                                <Upload className="w-8 h-8 mx-auto mb-2" />
                                <span className="text-xs">Click or Drag to Upload</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-3 text-center">
                    <h3 className="font-medium text-gray-900 dark:text-white">{fieldLabel}</h3>
                    {fileUrl && !previewUrl && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {fieldLabel} uploaded
                        </p>
                    )}
                </div>
            </div>

            {/* Upload Section */}
            <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-center">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Drag and drop your {fieldLabel.toLowerCase()} here, or click to browse
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Supports: JPEG, PNG, GIF, WEBP, SVG (Max 5MB)
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id={`file-upload-${fieldName}`}
                    />

                    <label
                        htmlFor={`file-upload-${fieldName}`}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors cursor-pointer"
                    >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Choose {fieldLabel}
                    </label>
                </div>

                {selectedFile && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Image className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {selectedFile.name}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isProcessing}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Upload {fieldLabel}
                        </>
                    )}
                </button>

                {fileUrl && !selectedFile && onRemoveFile && (
                    <button
                        onClick={handleRemoveFile}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-4 h-4" />
                        Remove {fieldLabel}
                    </button>
                )}

                <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    Cancel
                </button>
            </div>

            {/* Tips */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="text-sm font-medium text-purple-800 dark:text-purple-400 mb-2">Tips</h3>
                <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1 list-disc list-inside">
                    <li>Use a clear, well-lit image for best results</li>
                    <li>Logo: square dimensions preferred (e.g., 200x200)</li>
                    <li>Favicon: use a square image or a dedicated .ico file</li>
                    <li>Allowed formats: JPEG, PNG, GIF, WEBP, SVG</li>
                    <li>Maximum file size: 5MB</li>
                </ul>
            </div>
        </div>
    );
};

export default CompanyFileUpload;
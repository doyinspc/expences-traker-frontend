// src/components/purchase_orders/ViewAttachmentsModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, FileText, Image, File, Loader2, Eye, Calendar, User } from 'lucide-react';

interface Attachment {
  id: string | number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  description?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
  created_at?: string;
}

interface ViewAttachmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (attachment: Attachment) => void;
  onDelete?: (attachment: Attachment) => void;
  attachments: Attachment[];
  isLoading: boolean;
  itemName: string;
  itemId: string | number;
  canDelete?: boolean;
}

const ViewAttachmentsModal: React.FC<ViewAttachmentsModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  onDelete,
  attachments = [],
  isLoading,
  itemName,
  itemId,
  canDelete = false,
}) => {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  if (!isOpen) return null;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileExtension = (fileName: string) => {
    return fileName?.split('.').pop()?.toUpperCase() || 'Unknown';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Attachments
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Item: {itemName} (ID: {itemId})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-sm text-gray-500">Loading attachments...</span>
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-12">
              <File className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No attachments found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Upload a receipt for this item
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(attachment.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getFileSize(attachment.file_size)} • {getFileExtension(attachment.file_name)}
                      </p>
                      {attachment.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {attachment.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        {attachment.uploaded_by_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {attachment.uploaded_by_name}
                          </span>
                        )}
                        {attachment.uploaded_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(attachment.uploaded_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {onDownload && (
                        <button
                          onClick={() => onDownload(attachment)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && onDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${attachment.file_name}"?`)) {
                              onDelete(attachment);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedAttachment(selectedAttachment?.id === attachment.id ? null : attachment)}
                        className="p-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  {selectedAttachment?.id === attachment.id && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      {attachment.file_type?.startsWith('image/') ? (
                        <img
                          src={attachment.file_path}
                          alt={attachment.file_name}
                          className="max-h-64 w-auto mx-auto rounded-lg"
                        />
                      ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Preview not available for this file type
                          </p>
                          <button
                            onClick={() => onDownload?.(attachment)}
                            className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                          >
                            <Download className="w-4 h-4" />
                            Download to view
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAttachmentsModal;
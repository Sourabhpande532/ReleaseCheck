import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, releaseName, onConfirm, onCancel, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content-custom">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2 text-danger">
            <AlertTriangle size={22} />
            <h5 id="modal-title" className="m-0 fw-bold">Delete Release</h5>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-muted p-0"
            onClick={onCancel}
            aria-label="Close"
            disabled={isDeleting}
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-secondary mb-4">
          Are you sure you want to delete <strong className="text-dark">{releaseName}</strong>? This action cannot be undone.
        </p>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light border px-3"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger-solid px-3"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

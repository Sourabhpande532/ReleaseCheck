import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Trash2, ArrowLeft } from 'lucide-react';
import {
  setActiveView,
  createRelease,
  updateRelease,
  deleteRelease
} from '../store/releasesSlice';
import DeleteConfirmModal from './DeleteConfirmModal';

const ReleaseForm = () => {
  const dispatch = useDispatch();
  const { currentRelease, steps, saving, activeView } = useSelector((state) => state.releases);

  const isEditMode = Boolean(currentRelease && currentRelease.id);

  // Form state
  const [name, setName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Initialize form data
  useEffect(() => {
    if (isEditMode && currentRelease) {
      setName(currentRelease.name || '');
      setReleaseDate(currentRelease.release_date || '');
      setAdditionalInfo(currentRelease.additional_info || '');
      const stepsArr = Array.isArray(currentRelease.steps_completed)
        ? currentRelease.steps_completed
        : [];
      setCompletedSteps(stepsArr);
    } else {
      // Default new release date to today's date
      const today = new Date().toISOString().split('T')[0];
      setName('');
      setReleaseDate(today);
      setAdditionalInfo('');
      setCompletedSteps([]);
    }
    setValidationErrors({});
    setSaveSuccessMsg('');
  }, [currentRelease, isEditMode, activeView]);

  // Compute live status
  const currentStatus = useMemo(() => {
    const total = steps.length || 7;
    const count = completedSteps.length;
    if (count === 0) return 'planned';
    if (count >= total) return 'done';
    return 'ongoing';
  }, [completedSteps, steps]);

  const handleStepToggle = (stepId) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) {
        return prev.filter((id) => id !== stepId);
      } else {
        return [...prev, stepId];
      }
    });
  };

  const handleBack = (e) => {
    e.preventDefault();
    dispatch(setActiveView('list'));
  };

  const validate = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Release name is required.';
    }
    if (!releaseDate) {
      errors.releaseDate = 'Release date is required.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      release_date: releaseDate,
      additional_info: additionalInfo.trim(),
      steps_completed: completedSteps
    };

    if (isEditMode) {
      const res = await dispatch(updateRelease({ id: currentRelease.id, data: payload }));
      if (!res.error) {
        setSaveSuccessMsg('Release updated successfully!');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      }
    } else {
      const res = await dispatch(createRelease(payload));
      if (!res.error) {
        dispatch(setActiveView('list'));
      }
    }
  };

  const handleDelete = async () => {
    if (currentRelease && currentRelease.id) {
      await dispatch(deleteRelease(currentRelease.id));
      setShowDeleteModal(false);
      dispatch(setActiveView('list'));
    }
  };

  const completionPercentage = steps.length > 0
    ? Math.round((completedSteps.length / steps.length) * 100)
    : 0;

  return (
    <div className="main-card">
      {/* Top Header / Breadcrumb Bar */}
      <div className="card-header-bar">
        <nav className="breadcrumb-nav" aria-label="breadcrumb">
          <a href="#releases" onClick={handleBack} className="d-inline-flex align-items-center gap-1">
            <ArrowLeft size={16} />
            <span>All releases</span>
          </a>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-current">
            {isEditMode ? name || 'Edit Release' : 'New release'}
          </span>
        </nav>

        {isEditMode && (
          <button
            type="button"
            className="btn-danger-custom"
            onClick={() => setShowDeleteModal(true)}
            id="btn-delete-release-detail"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-4" role="alert">
          <Check size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Release Name & Date Row */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <label htmlFor="release-name" className="form-label-custom">
              Release
            </label>
            <input
              type="text"
              id="release-name"
              className={`form-control-custom ${validationErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Version 1.0.1"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationErrors.name) {
                  setValidationErrors((prev) => ({ ...prev, name: null }));
                }
              }}
              required
            />
            {validationErrors.name && (
              <div className="text-danger small mt-1">{validationErrors.name}</div>
            )}
          </div>

          <div className="col-12 col-md-6">
            <label htmlFor="release-date" className="form-label-custom">
              Date
            </label>
            <input
              type="date"
              id="release-date"
              className={`form-control-custom ${validationErrors.releaseDate ? 'is-invalid' : ''}`}
              value={releaseDate}
              onChange={(e) => {
                setReleaseDate(e.target.value);
                if (validationErrors.releaseDate) {
                  setValidationErrors((prev) => ({ ...prev, releaseDate: null }));
                }
              }}
              required
            />
            {validationErrors.releaseDate && (
              <div className="text-danger small mt-1">{validationErrors.releaseDate}</div>
            )}
          </div>
        </div>

        {/* Live Progress Bar and Computed Status */}
        <div className="mb-4 p-3 bg-light rounded-3 border">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="small fw-semibold text-secondary">
              Checklist Progress: {completedSteps.length} of {steps.length} completed ({completionPercentage}%)
            </div>
            <div>
              <span className="small text-muted me-2">Auto Status:</span>
              <span className={`status-pill ${currentStatus}`}>
                {currentStatus}
              </span>
            </div>
          </div>
          <div className="checklist-progress-bar">
            <div
              className={`checklist-progress-fill ${currentStatus === 'done' ? 'all-done' : ''}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Checklist Section */}
        <div className="checklist-section">
          <div className="checklist-title">Release Checklist Steps</div>
          <div className="steps-container">
            {steps.map((step) => {
              const isChecked = completedSteps.includes(step.id);
              return (
                <label
                  key={step.id}
                  className={`checklist-item ${isChecked ? 'checked' : ''}`}
                  htmlFor={`step-${step.id}`}
                >
                  <input
                    type="checkbox"
                    id={`step-${step.id}`}
                    checked={isChecked}
                    onChange={() => handleStepToggle(step.id)}
                    aria-checked={isChecked}
                  />
                  <span className="checklist-label mb-0">
                    {step.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Additional Remarks Section */}
        <div className="mb-4">
          <label htmlFor="additional-remarks" className="form-label-custom">
            Additional remarks / tasks
          </label>
          <textarea
            id="additional-remarks"
            className="form-textarea-custom"
            placeholder="Please enter any other important notes for the release"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
        </div>

        {/* Form Actions Footer */}
        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <button
            type="button"
            className="btn btn-outline-secondary px-3"
            onClick={handleBack}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-primary-custom px-4"
            disabled={saving}
            id="btn-save-release"
          >
            <Check size={18} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        releaseName={name || 'this release'}
        isDeleting={saving}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default ReleaseForm;

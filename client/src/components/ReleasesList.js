import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusCircle, Eye, Trash2, Calendar, ClipboardCheck } from 'lucide-react';
import {
  setActiveView,
  setCurrentRelease,
  deleteRelease
} from '../store/releasesSlice';
import { formatDate } from '../utils/date';
import DeleteConfirmModal from './DeleteConfirmModal';

const ReleasesList = () => {
  const dispatch = useDispatch();
  const { items: releases, loading, saving } = useSelector((state) => state.releases);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const handleNewRelease = () => {
    dispatch(setCurrentRelease(null));
    dispatch(setActiveView('new'));
  };

  const handleViewRelease = (release) => {
    dispatch(setCurrentRelease(release));
    dispatch(setActiveView('detail'));
  };

  const promptDelete = (e, release) => {
    e.stopPropagation();
    setDeleteCandidate(release);
  };

  const confirmDelete = async () => {
    if (deleteCandidate) {
      await dispatch(deleteRelease(deleteCandidate.id));
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="main-card">
      {/* Card Header Bar */}
      <div className="card-header-bar">
        <div>
          <span className="tab-link-active">
            All releases
          </span>
        </div>
        <button
          type="button"
          className="btn-primary-custom"
          onClick={handleNewRelease}
          id="btn-new-release"
        >
          <PlusCircle size={16} />
          <span>New release</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && releases.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading releases...</span>
          </div>
          <p className="mt-2 text-muted">Loading releases...</p>
        </div>
      ) : releases.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <ClipboardCheck size={48} className="empty-state-icon" />
          <h5 className="fw-semibold">No releases created yet</h5>
          <p className="text-muted mb-3">Create your first release to track your deployment checklist.</p>
          <button
            type="button"
            className="btn-primary-custom"
            onClick={handleNewRelease}
          >
            <PlusCircle size={16} />
            <span>Create Release</span>
          </button>
        </div>
      ) : (
        /* Table View */
        <div className="responsive-table-container">
          <table className="custom-table" aria-label="Releases checklist table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '30%' }}>Release</th>
                <th scope="col" style={{ width: '30%' }}>Date</th>
                <th scope="col" style={{ width: '20%' }}>Status</th>
                <th scope="col" style={{ width: '10%' }} className="text-center">View</th>
                <th scope="col" style={{ width: '10%' }} className="text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((release) => {
                const statusClass = (release.status || 'planned').toLowerCase();
                return (
                  <tr key={release.id} className="release-row">
                    <td className="fw-semibold text-dark">
                      {release.name}
                    </td>
                    <td>
                      <span className="d-inline-flex align-items-center gap-2">
                        <Calendar size={14} className="text-muted" />
                        {formatDate(release.release_date)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${statusClass}`}>
                        {release.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn-action-view"
                        onClick={() => handleViewRelease(release)}
                        title="View release checklist"
                        aria-label={`View ${release.name}`}
                      >
                        <Eye size={16} />
                        <span className="d-none d-md-inline">View</span>
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn-action-delete"
                        onClick={(e) => promptDelete(e, release)}
                        title="Delete release"
                        aria-label={`Delete ${release.name}`}
                      >
                        <Trash2 size={16} />
                        <span className="d-none d-md-inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteCandidate)}
        releaseName={deleteCandidate ? deleteCandidate.name : ''}
        isDeleting={saving}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};

export default ReleasesList;

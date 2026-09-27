import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
import ReleasesList from './components/ReleasesList';
import ReleaseForm from './components/ReleaseForm';
import { fetchReleases, fetchSteps, clearError } from './store/releasesSlice';
import { AlertCircle, X } from 'lucide-react';

function App() {
  const dispatch = useDispatch();
  const { activeView, error } = useSelector((state) => state.releases);

  useEffect(() => {
    dispatch(fetchSteps());
    dispatch(fetchReleases());
  }, [dispatch]);

  return (
    <div className="min-vh-100 pb-5">
      <Header />

      <main className="container" style={{ maxWidth: '880px' }}>
        {error && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4" role="alert">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-danger p-0"
              onClick={() => dispatch(clearError())}
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {activeView === 'list' ? <ReleasesList /> : <ReleaseForm />}
      </main>

      <footer className="text-center text-muted small py-4">
        <p className="mb-0">
          ReleaseCheck &copy; {new Date().getFullYear()} &bull; Professional Release Workflow
        </p>
      </footer>
    </div>
  );
}

export default App;

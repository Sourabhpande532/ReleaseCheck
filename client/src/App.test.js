import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import releasesReducer from './store/releasesSlice';
import App from './App';

const renderWithStore = (preloadedState = {}) => {
  const store = configureStore({
    reducer: {
      releases: releasesReducer
    },
    preloadedState
  });

  return render(
    <Provider store={store}>
      <App />
    </Provider>
  );
};

describe('ReleaseCheck App Flow', () => {
  test('renders header and releases tab', () => {
    renderWithStore({
      releases: {
        items: [],
        steps: [
          { id: 'pr_merged', label: 'All relevant Github pull requests have been merged' },
          { id: 'changelog_updated', label: 'CHANGELOG.md files have been updated' },
          { id: 'tests_passing', label: 'All tests are passing' }
        ],
        currentRelease: null,
        activeView: 'list',
        loading: false,
        saving: false,
        error: null
      }
    });

    expect(screen.getByText('ReleaseCheck')).toBeInTheDocument();
    expect(screen.getByText('Your all-in-one release checklist tool')).toBeInTheDocument();
    expect(screen.getByText('All releases')).toBeInTheDocument();
    expect(screen.getByText('New release')).toBeInTheDocument();
  });

  test('switches to form when clicking New release', () => {
    renderWithStore({
      releases: {
        items: [],
        steps: [
          { id: 'pr_merged', label: 'All relevant Github pull requests have been merged' },
          { id: 'changelog_updated', label: 'CHANGELOG.md files have been updated' }
        ],
        currentRelease: null,
        activeView: 'list',
        loading: false,
        saving: false,
        error: null
      }
    });

    const newReleaseBtn = screen.getByRole('button', { name: /new release/i });
    fireEvent.click(newReleaseBtn);

    expect(screen.getByLabelText('Release')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByText(/All relevant Github pull requests have been merged/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  test('checklist toggle updates step completion', () => {
    renderWithStore({
      releases: {
        items: [],
        steps: [
          { id: 'pr_merged', label: 'All relevant Github pull requests have been merged' },
          { id: 'changelog_updated', label: 'CHANGELOG.md files have been updated' }
        ],
        currentRelease: null,
        activeView: 'new',
        loading: false,
        saving: false,
        error: null
      }
    });

    const stepText = screen.getByText(/All relevant Github pull requests have been merged/i);
    expect(screen.getByText(/0 of 2 completed/i)).toBeInTheDocument();

    // Click label
    fireEvent.click(stepText);
    expect(screen.getByText(/1 of 2 completed/i)).toBeInTheDocument();

    // Click checkbox directly
    const checkbox2 = screen.getByRole('checkbox', { name: /CHANGELOG.md files have been updated/i });
    fireEvent.click(checkbox2);
    expect(screen.getByText(/2 of 2 completed/i)).toBeInTheDocument();
  });
});

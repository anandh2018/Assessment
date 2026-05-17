import { useState, useCallback } from 'react';
import API from '../api';

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (keyword.trim()) params.query = keyword.trim();
      if (ratingFilter) params.rating = parseInt(ratingFilter);
      if (programFilter.trim()) params.program_name = programFilter.trim();

      const res = await API.get('/feedback/search', { params });
      setResults(res.data);
      setSearched(true);
    } catch {
      setError('Search failed. Make sure the backend is running on port 8001.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setRatingFilter('');
    setProgramFilter('');
    setResults([]);
    setSearched(false);
    setError('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div>
      <h1 className="page-title">Search & Filter Feedback</h1>

      <form onSubmit={handleSearch}>
        <div className="search-filters">
          <div className="filter-group">
            <label>Keyword Search</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search participant, program, comments..."
            />
          </div>

          <div className="filter-group" style={{ maxWidth: 180 }}>
            <label>Rating</label>
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="">All Ratings</option>
              <option value="5">5 ⭐ Excellent</option>
              <option value="4">4 ⭐ Very Good</option>
              <option value="3">3 ⭐ Good</option>
              <option value="2">2 ⭐ Fair</option>
              <option value="1">1 ⭐ Poor</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Program Name</label>
            <input
              type="text"
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              placeholder="Filter by program..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <div className="loading">Searching...</div>}

      {!loading && searched && (
        <>
          <div style={{ marginBottom: '1rem', color: '#555', fontWeight: 600 }}>
            {results.length === 0
              ? 'No results found.'
              : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
          </div>

          {results.length === 0 ? (
            <div className="no-results">
              No feedback matched your search criteria. Try different filters.
            </div>
          ) : (
            <div className="results-grid">
              {results.map((fb) => (
                <div key={fb.feedback_id} className="result-card">
                  <div className="result-card-header">
                    <h3>{fb.participant_name}</h3>
                    <span className={`rating-badge rating-${fb.rating}`}>
                      {'⭐'.repeat(fb.rating)} {fb.rating}/5
                    </span>
                  </div>
                  <div className="program">📚 {fb.program_name}</div>
                  {fb.comments && <div className="comments">{fb.comments}</div>}
                  <div className="date">🗓 {formatDate(fb.submitted_at)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !searched && (
        <div className="no-results" style={{ background: '#f8f9ff', border: '2px dashed #1a73e8' }}>
          Enter a keyword, select a rating, or filter by program name and click Search.
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import API from '../api';

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Technology', 'Philosophy', 'Other'];

export default function Search() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    const params = {};
    if (query) params.search = query;

    API.get('/books', { params })
      .then(res => {
        let filtered = res.data;
        if (category) {
          filtered = filtered.filter(b => b.category && b.category.toLowerCase() === category.toLowerCase());
        }
        if (author) {
          filtered = filtered.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
        }
        setResults(filtered);
        setSearched(true);
      })
      .catch(() => setError('Search failed. Make sure the backend is running.'));
  };

  // Live search on Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch(e);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Search Books</h1>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Search by title, author, or category..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 2, minWidth: 240 }}
        />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="text"
          placeholder="Filter by author..."
          value={author}
          onChange={e => setAuthor(e.target.value)}
          style={{ minWidth: 180 }}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {searched && (
        <>
          <p style={{ color: '#666', marginBottom: 16, fontSize: '0.9rem' }}>
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          {results.length === 0 ? (
            <div className="empty-state">No books match your search.</div>
          ) : (
            <div className="book-cards">
              {results.map(b => (
                <div key={b.book_id} className="book-card">
                  <h3>{b.title}</h3>
                  <p><strong>Author:</strong> {b.author}</p>
                  <p><strong>Category:</strong> {b.category || '—'}</p>
                  <p><strong>ISBN:</strong> {b.isbn || '—'}</p>
                  <div style={{ marginTop: 10 }}>
                    <span className={`badge badge-${b.availability_status}`}>
                      {b.availability_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

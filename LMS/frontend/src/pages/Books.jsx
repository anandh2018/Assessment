import { useState, useEffect } from 'react';
import API from '../api';

const EMPTY_FORM = { title: '', author: '', category: '', isbn: '' };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchBooks = () => {
    API.get('/books')
      .then(res => setBooks(res.data))
      .catch(() => setError('Failed to load books.'));
  };

  useEffect(() => { fetchBooks(); }, []);

  const openAdd = () => {
    setEditBook(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (book) => {
    setEditBook(book);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category || '',
      isbn: book.isbn || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const req = editBook
      ? API.put(`/books/${editBook.book_id}`, form)
      : API.post('/books', form);
    req
      .then(() => { setShowModal(false); fetchBooks(); })
      .catch(() => setError('Failed to save book.'));
  };

  const handleDelete = (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    API.delete(`/books/${book.book_id}`)
      .then(() => fetchBooks())
      .catch(() => setError('Failed to delete book.'));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Books</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Book</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>ISBN</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan={7} className="empty-state">No books found.</td></tr>
            ) : books.map(b => (
              <tr key={b.book_id}>
                <td>{b.book_id}</td>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.category || '—'}</td>
                <td>{b.isbn || '—'}</td>
                <td>
                  <span className={`badge badge-${b.availability_status}`}>
                    {b.availability_status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => openEdit(b)} style={{marginRight: 6}}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <input required value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div className="form-group">
                <label>ISBN</label>
                <input value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" style={{background:'#eee'}} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editBook ? 'Save Changes' : 'Add Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

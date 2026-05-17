import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, searchTickets, deleteTicket } from '../services/api';
import { Badge, PRIORITY_STYLES, STATUS_STYLES } from '../components/TicketCard';

const CATEGORIES = [
  '', 'VPN Issue', 'Password Reset', 'Software Installation',
  'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request',
];
const STATUSES = ['', 'Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['', 'Low', 'Medium', 'High', 'Critical'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function TicketList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (keyword || filterStatus || filterCategory || filterPriority) {
        res = await searchTickets({
          keyword: keyword || undefined,
          status: filterStatus || undefined,
          category: filterCategory || undefined,
          priority: filterPriority || undefined,
        });
      } else {
        res = await getAllTickets();
      }
      setTickets(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, filterStatus, filterCategory, filterPriority]);

  useEffect(() => {
    const timer = setTimeout(fetchTickets, 300);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.ticket_id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setKeyword('');
    setFilterStatus('');
    setFilterCategory('');
    setFilterPriority('');
  };

  const hasFilters = keyword || filterStatus || filterCategory || filterPriority;

  const styles = {
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
    },
    title: { fontSize: '22px', fontWeight: '700', color: '#1a202c' },
    subtitle: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
    btnNew: {
      padding: '8px 18px', fontSize: '13px', fontWeight: '600',
      backgroundColor: '#1a56db', color: '#fff', border: 'none', borderRadius: '7px',
    },
    filterBar: {
      backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
      padding: '16px', marginBottom: '20px',
      display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    searchInput: {
      flex: '1', minWidth: '200px', padding: '8px 12px',
      border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px',
    },
    filterSelect: {
      padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '7px',
      fontSize: '13px', color: '#374151', backgroundColor: '#fff', cursor: 'pointer',
      minWidth: '130px',
    },
    clearBtn: {
      padding: '8px 12px', fontSize: '13px', fontWeight: '500',
      backgroundColor: '#f3f4f6', color: '#374151',
      border: '1px solid #d1d5db', borderRadius: '7px', cursor: 'pointer',
    },
    card: {
      backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    },
    countBar: {
      padding: '10px 16px', borderBottom: '1px solid #e2e8f0',
      fontSize: '13px', color: '#6b7280', backgroundColor: '#f8fafc',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '10px 14px', textAlign: 'left',
      fontSize: '11px', fontWeight: '700', color: '#6b7280',
      textTransform: 'uppercase', letterSpacing: '0.6px',
      backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0',
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '11px 14px', fontSize: '13px', color: '#374151',
      borderBottom: '1px solid #f0f4f8', verticalAlign: 'middle',
    },
    btnEdit: {
      padding: '4px 10px', fontSize: '12px', fontWeight: '500',
      backgroundColor: '#dbeafe', color: '#1e40af',
      border: '1px solid #bfdbfe', borderRadius: '5px', cursor: 'pointer',
      marginRight: '6px',
    },
    btnDel: {
      padding: '4px 10px', fontSize: '12px', fontWeight: '500',
      backgroundColor: '#fee2e2', color: '#991b1b',
      border: '1px solid #fca5a5', borderRadius: '5px', cursor: 'pointer',
    },
    emptyState: {
      padding: '48px', textAlign: 'center', color: '#9ca3af',
    },
    // Modal
    overlay: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modal: {
      backgroundColor: '#fff', borderRadius: '12px', padding: '28px',
      maxWidth: '380px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    },
    modalTitle: { fontSize: '16px', fontWeight: '700', color: '#1a202c', marginBottom: '8px' },
    modalText: { fontSize: '14px', color: '#6b7280', marginBottom: '20px' },
    modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    btnModalCancel: {
      padding: '8px 16px', fontSize: '13px', fontWeight: '500',
      backgroundColor: '#fff', color: '#374151',
      border: '1px solid #d1d5db', borderRadius: '7px', cursor: 'pointer',
    },
    btnModalDelete: {
      padding: '8px 16px', fontSize: '13px', fontWeight: '600',
      backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '7px',
      cursor: deleting ? 'not-allowed' : 'pointer',
      opacity: deleting ? 0.7 : 1,
    },
  };

  return (
    <div>
      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>Delete Ticket #{deleteConfirm}?</div>
            <div style={styles.modalText}>
              This action cannot be undone. The ticket and all its data will be permanently deleted.
            </div>
            <div style={styles.modalActions}>
              <button style={styles.btnModalCancel} onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                style={styles.btnModalDelete}
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <div style={styles.title}>All Tickets</div>
          <div style={styles.subtitle}>Manage and track IT support requests</div>
        </div>
        <button style={styles.btnNew} onClick={() => navigate('/tickets/new')}>
          + New Ticket
        </button>
      </div>

      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by name, department, issue..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={styles.searchInput}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={styles.filterSelect}>
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={styles.filterSelect}>
          <option value="">All Priorities</option>
          {PRIORITIES.filter(Boolean).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {hasFilters && (
          <button style={styles.clearBtn} onClick={clearFilters}>Clear</button>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2', border: '1px solid #fca5a5',
          color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.countBar}>
          {loading ? 'Loading...' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} found`}
        </div>
        {!loading && tickets.length === 0 ? (
          <div style={styles.emptyState}>
            {hasFilters
              ? 'No tickets match your filters.'
              : 'No tickets yet. Create the first one!'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.ticket_id}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <td style={{ ...styles.td, color: '#6b7280', fontWeight: '600' }}>#{t.ticket_id}</td>
                    <td style={{ ...styles.td, fontWeight: '500' }}>{t.employee_name}</td>
                    <td style={styles.td}>{t.department}</td>
                    <td style={styles.td}>{t.issue_category}</td>
                    <td style={styles.td}><Badge text={t.priority} styleMap={PRIORITY_STYLES} /></td>
                    <td style={styles.td}><Badge text={t.status} styleMap={STATUS_STYLES} /></td>
                    <td style={styles.td}>{formatDate(t.created_at)}</td>
                    <td style={styles.td}>
                      <button style={styles.btnEdit} onClick={() => navigate(`/tickets/${t.ticket_id}`)}>
                        Edit
                      </button>
                      <button style={styles.btnDel} onClick={() => setDeleteConfirm(t.ticket_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketList;

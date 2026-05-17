import React from 'react';
import { useNavigate } from 'react-router-dom';

const PRIORITY_STYLES = {
  Critical: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
  High:     { backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74' },
  Medium:   { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' },
  Low:      { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
};

const STATUS_STYLES = {
  'Open':        { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' },
  'In Progress': { backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #a5b4fc' },
  'Resolved':    { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
  'Closed':      { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Badge({ text, styleMap, fallbackColor = '#6b7280' }) {
  const s = styleMap[text] || { backgroundColor: '#f3f4f6', color: fallbackColor, border: '1px solid #e5e7eb' };
  return (
    <span style={{
      ...s,
      padding: '2px 8px',
      borderRadius: '9999px',
      fontSize: '11px',
      fontWeight: '600',
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
}

function TicketCard({ ticket, onDelete }) {
  const navigate = useNavigate();

  const styles = {
    card: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      cursor: 'pointer',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '10px',
      gap: '8px',
    },
    ticketId: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '600',
      letterSpacing: '0.5px',
    },
    name: {
      fontWeight: '600',
      fontSize: '15px',
      color: '#1a202c',
      marginBottom: '2px',
    },
    category: {
      fontSize: '13px',
      color: '#4a5568',
      marginBottom: '10px',
    },
    badges: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
      marginBottom: '10px',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid #f0f4f8',
      paddingTop: '10px',
      marginTop: '6px',
    },
    date: {
      fontSize: '11px',
      color: '#9ca3af',
    },
    actions: {
      display: 'flex',
      gap: '6px',
    },
    btnView: {
      padding: '4px 10px',
      fontSize: '12px',
      backgroundColor: '#3182ce',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      fontWeight: '500',
    },
    btnDelete: {
      padding: '4px 10px',
      fontSize: '12px',
      backgroundColor: '#fff',
      color: '#e53e3e',
      border: '1px solid #e53e3e',
      borderRadius: '5px',
      fontWeight: '500',
    },
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(ticket.ticket_id);
  };

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#93c5fd';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      <div style={styles.header}>
        <div>
          <div style={styles.ticketId}>TICKET #{ticket.ticket_id}</div>
          <div style={styles.name}>{ticket.employee_name}</div>
        </div>
      </div>
      <div style={styles.category}>{ticket.issue_category} &bull; {ticket.department}</div>
      <div style={styles.badges}>
        <Badge text={ticket.priority} styleMap={PRIORITY_STYLES} />
        <Badge text={ticket.status} styleMap={STATUS_STYLES} />
      </div>
      <div style={styles.footer}>
        <span style={styles.date}>{formatDate(ticket.created_at)}</span>
        <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
          <button
            style={styles.btnView}
            onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
          >
            View
          </button>
          {onDelete && (
            <button style={styles.btnDelete} onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { PRIORITY_STYLES, STATUS_STYLES, Badge };
export default TicketCard;

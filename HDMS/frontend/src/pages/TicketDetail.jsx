import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicket, updateTicket } from '../services/api';
import { Badge, PRIORITY_STYLES, STATUS_STYLES } from '../components/TicketCard';

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

function DetailRow({ label, value, children }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '160px 1fr',
      gap: '8px', padding: '12px 0', borderBottom: '1px solid #f0f4f8',
      alignItems: 'start',
    }}>
      <span style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', paddingTop: '2px' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', color: '#1a202c' }}>
        {children || value || '—'}
      </span>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    getTicket(id)
      .then((res) => {
        setTicket(res.data);
        setStatus(res.data.status);
        setResolutionNotes(res.data.resolution_notes || '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      const res = await updateTicket(id, {
        status,
        resolution_notes: resolutionNotes || null,
      });
      setTicket(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    ticket && (status !== ticket.status || resolutionNotes !== (ticket.resolution_notes || ''));

  const styles = {
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
    },
    titleArea: { display: 'flex', alignItems: 'center', gap: '12px' },
    btnBack: {
      padding: '7px 14px', fontSize: '13px', fontWeight: '500',
      backgroundColor: '#fff', color: '#374151',
      border: '1px solid #d1d5db', borderRadius: '7px', cursor: 'pointer',
    },
    title: { fontSize: '20px', fontWeight: '700', color: '#1a202c' },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 360px',
      gap: '20px',
      alignItems: 'start',
    },
    card: {
      backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    },
    cardHeader: {
      padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
      fontSize: '14px', fontWeight: '600', color: '#374151',
      backgroundColor: '#f8fafc',
    },
    cardBody: { padding: '0 20px' },
    cardBodyPad: { padding: '20px' },
    sectionTitle: {
      fontSize: '14px', fontWeight: '600', color: '#374151',
      marginBottom: '14px',
    },
    selectInput: {
      width: '100%', padding: '9px 12px',
      border: '1px solid #d1d5db', borderRadius: '7px',
      fontSize: '14px', color: '#1a202c', backgroundColor: '#fff',
      cursor: 'pointer', marginBottom: '14px',
    },
    textarea: {
      width: '100%', padding: '9px 12px',
      border: '1px solid #d1d5db', borderRadius: '7px',
      fontSize: '13px', color: '#1a202c',
      resize: 'vertical', minHeight: '100px', marginBottom: '14px',
    },
    btnSave: {
      width: '100%', padding: '10px', fontSize: '14px', fontWeight: '600',
      backgroundColor: saving ? '#93c5fd' : isDirty ? '#1a56db' : '#e5e7eb',
      color: saving ? '#fff' : isDirty ? '#fff' : '#9ca3af',
      border: 'none', borderRadius: '7px',
      cursor: saving || !isDirty ? 'not-allowed' : 'pointer',
    },
    successMsg: {
      backgroundColor: '#d1fae5', border: '1px solid #6ee7b7',
      color: '#065f46', padding: '10px 14px', borderRadius: '7px',
      fontSize: '13px', marginTop: '10px', textAlign: 'center',
    },
    errorMsg: {
      backgroundColor: '#fee2e2', border: '1px solid #fca5a5',
      color: '#991b1b', padding: '10px 14px', borderRadius: '7px',
      fontSize: '13px', marginTop: '10px',
    },
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
      Loading ticket...
    </div>
  );

  if (error) return (
    <div>
      <button style={styles.btnBack} onClick={() => navigate('/tickets')}>
        &larr; Back to Tickets
      </button>
      <div style={{
        marginTop: '16px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5',
        color: '#991b1b', padding: '16px', borderRadius: '8px',
      }}>
        {error}
      </div>
    </div>
  );

  if (!ticket) return null;

  return (
    <div>
      <div style={styles.header}>
        <div style={styles.titleArea}>
          <button style={styles.btnBack} onClick={() => navigate('/tickets')}>
            &larr; Back
          </button>
          <div style={styles.title}>Ticket #{ticket.ticket_id}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge text={ticket.priority} styleMap={PRIORITY_STYLES} />
          <Badge text={ticket.status} styleMap={STATUS_STYLES} />
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left: Ticket Details */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>Ticket Information</div>
          <div style={styles.cardBody}>
            <DetailRow label="Ticket ID">#{ticket.ticket_id}</DetailRow>
            <DetailRow label="Employee">{ticket.employee_name}</DetailRow>
            <DetailRow label="Department">{ticket.department}</DetailRow>
            <DetailRow label="Category">{ticket.issue_category}</DetailRow>
            <DetailRow label="Priority">
              <Badge text={ticket.priority} styleMap={PRIORITY_STYLES} />
            </DetailRow>
            <DetailRow label="Status">
              <Badge text={ticket.status} styleMap={STATUS_STYLES} />
            </DetailRow>
            <DetailRow label="Created At">{formatDate(ticket.created_at)}</DetailRow>
            <DetailRow label="Description">
              <span style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{ticket.description}</span>
            </DetailRow>
            {ticket.resolution_notes && (
              <DetailRow label="Resolution">
                <span style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#065f46' }}>
                  {ticket.resolution_notes}
                </span>
              </DetailRow>
            )}
          </div>
          <div style={{ height: '12px' }} />
        </div>

        {/* Right: Update Panel */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>Update Ticket</div>
            <div style={styles.cardBodyPad}>
              <div style={styles.sectionTitle}>Change Status</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={styles.selectInput}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <div style={styles.sectionTitle}>Resolution Notes</div>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add resolution notes or updates..."
                style={styles.textarea}
              />

              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                style={styles.btnSave}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              {saveSuccess && (
                <div style={styles.successMsg}>
                  Ticket updated successfully!
                </div>
              )}
              {saveError && (
                <div style={styles.errorMsg}>{saveError}</div>
              )}
            </div>
          </div>

          {/* Quick info card */}
          <div style={{ ...styles.card, marginTop: '16px' }}>
            <div style={styles.cardHeader}>Quick Info</div>
            <div style={styles.cardBodyPad}>
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
                <div><strong>Category:</strong> {ticket.issue_category}</div>
                <div><strong>Department:</strong> {ticket.department}</div>
                <div><strong>Opened:</strong> {formatDate(ticket.created_at)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetail;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets } from '../services/api';
import { Badge, PRIORITY_STYLES, STATUS_STYLES } from '../components/TicketCard';

function StatCard({ label, value, color, bgColor, icon }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      border: `1px solid ${color}30`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '10px',
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      minWidth: '0',
    }}>
      <div style={{
        width: '48px', height: '48px',
        borderRadius: '10px',
        backgroundColor: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: '700', color }}>{value}</div>
        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{label}</div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllTickets()
      .then((res) => setTickets(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
  };

  const recent = [...tickets].slice(0, 10);

  const styles = {
    header: {
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
    },
    title: { fontSize: '22px', fontWeight: '700', color: '#1a202c' },
    subtitle: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '32px',
    },
    section: {
      backgroundColor: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    sectionHeader: {
      padding: '16px 20px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: { fontWeight: '600', fontSize: '15px', color: '#1a202c' },
    viewAll: {
      fontSize: '13px', color: '#3182ce', fontWeight: '500',
      background: 'none', border: 'none', cursor: 'pointer',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '10px 16px', textAlign: 'left',
      fontSize: '11px', fontWeight: '700', color: '#6b7280',
      textTransform: 'uppercase', letterSpacing: '0.6px',
      backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0',
    },
    td: {
      padding: '12px 16px', fontSize: '13px', color: '#374151',
      borderBottom: '1px solid #f0f4f8', verticalAlign: 'middle',
    },
    trHover: { cursor: 'pointer' },
    btn: {
      padding: '6px 14px', fontSize: '13px', fontWeight: '600',
      backgroundColor: '#1a56db', color: '#fff',
      border: 'none', borderRadius: '6px', cursor: 'pointer',
    },
    emptyState: {
      padding: '48px', textAlign: 'center', color: '#9ca3af',
    },
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
      Loading dashboard...
    </div>
  );

  return (
    <div>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Dashboard</div>
          <div style={styles.subtitle}>Overview of all helpdesk tickets</div>
        </div>
        <button style={styles.btn} onClick={() => navigate('/tickets/new')}>
          + New Ticket
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2', border: '1px solid #fca5a5',
          color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
        }}>
          Error: {error}
        </div>
      )}

      <div style={styles.statsGrid}>
        <StatCard label="Total Tickets" value={stats.total} color="#3182ce" bgColor="#dbeafe" icon="🎫" />
        <StatCard label="Open" value={stats.open} color="#d97706" bgColor="#fef3c7" icon="📂" />
        <StatCard label="In Progress" value={stats.inProgress} color="#7c3aed" bgColor="#ede9fe" icon="⚙️" />
        <StatCard label="Resolved / Closed" value={stats.resolved} color="#059669" bgColor="#d1fae5" icon="✅" />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Recent Tickets</span>
          <button style={styles.viewAll} onClick={() => navigate('/tickets')}>
            View All &rarr;
          </button>
        </div>
        {recent.length === 0 ? (
          <div style={styles.emptyState}>
            No tickets yet. <button style={{ color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }} onClick={() => navigate('/tickets/new')}>Create one now</button>
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
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr
                    key={t.ticket_id}
                    style={styles.trHover}
                    onClick={() => navigate(`/tickets/${t.ticket_id}`)}
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

export default Dashboard;

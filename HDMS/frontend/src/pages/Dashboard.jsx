import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, getAnalyticsSummary, getAnalyticsCategories, getAnalyticsDepartments, runETL } from '../services/api';
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

  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [etlLoading, setEtlLoading] = useState(false);
  const [etlMsg, setEtlMsg] = useState('');

  useEffect(() => {
    getAllTickets()
      .then((res) => setTickets(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getAnalyticsCategories(), getAnalyticsDepartments()])
      .then(([s, c, d]) => { setAnalytics(s); setCategories(c); setDepartments(d); })
      .catch(() => {});
  }, []);

  const handleRunETL = () => {
    setEtlLoading(true);
    setEtlMsg('');
    runETL()
      .then(res => {
        setEtlMsg(`ETL complete: ${res.records_processed} records processed.`);
        return Promise.all([getAnalyticsSummary(), getAnalyticsCategories(), getAnalyticsDepartments()]);
      })
      .then(([s, c, d]) => { setAnalytics(s); setCategories(c); setDepartments(d); })
      .catch(() => setEtlMsg('ETL failed. Ensure backend is running.'))
      .finally(() => setEtlLoading(false));
  };

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

      {/* ETL Analytics */}
      <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', marginTop: '24px', border: '2px solid #0d6efd', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>ETL Analytics Pipeline</h3>
          <button onClick={handleRunETL} disabled={etlLoading} style={{ background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer', fontWeight: 600 }}>
            {etlLoading ? 'Running...' : 'Run ETL'}
          </button>
        </div>
        {etlMsg && <div style={{ padding: '8px 12px', background: '#e7f1ff', borderRadius: '6px', color: '#0d6efd', marginBottom: '12px', fontSize: '14px' }}>{etlMsg}</div>}
        {analytics && analytics.total_records > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
              {[{ label: 'Total Records', value: analytics.total_records }, { label: 'Resolved', value: analytics.resolved_count }, { label: 'Avg Resolution (hrs)', value: analytics.avg_resolution_hours }].map(s => (
                <div key={s.label} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#0d6efd' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {categories.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 600, marginBottom: '10px' }}>Top Issue Categories</div>
                {categories.slice(0, 8).map(c => (
                  <div key={c.issue_category} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ width: '150px', fontSize: '12px', color: '#555' }}>{c.issue_category}</div>
                    <div style={{ flex: 1, background: '#eee', borderRadius: '4px', height: '16px' }}>
                      <div style={{ width: `${Math.min((c.total_count / 25) * 100, 100)}%`, background: '#0d6efd', height: '100%', borderRadius: '4px' }} />
                    </div>
                    <div style={{ width: '28px', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>{c.total_count}</div>
                  </div>
                ))}
              </div>
            )}
            {departments.length > 0 && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: '10px' }}>Department-wise Tickets</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee', background: '#f8f9fa' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Department</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px' }}>Total</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px' }}>Resolved</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px' }}>Avg Hrs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <tr key={d.department} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '6px 8px' }}>{d.department}</td>
                        <td style={{ textAlign: 'center', padding: '6px 8px' }}>{d.ticket_count}</td>
                        <td style={{ textAlign: 'center', padding: '6px 8px', color: '#27ae60' }}>{d.resolved_count}</td>
                        <td style={{ textAlign: 'center', padding: '6px 8px' }}>{d.avg_resolution_hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px', fontSize: '14px' }}>
            No ETL data loaded. Click "Run ETL" to process the dataset.
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

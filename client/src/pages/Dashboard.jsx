import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Users, Code, Activity, HelpCircle, UserCheck, ArrowUpRight, Layers, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRESET_DOMAINS = [
  'MERN stack', 
  'Full stack (DJANGO)', 
  'FULL STACK PHP', 
  'WEB DESIGN', 
  'Data Analytics', 
  'DATA Science', 
  'AI/ML'
];

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('interns'); // 'interns' | 'enquiries'
  const [hoveredBar, setHoveredBar] = useState(null);
  const [selectedDomainModal, setSelectedDomainModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, enquiryRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/students`, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(`${API_BASE_URL}/api/enquiries`, { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        setStudents(studentRes.data);
        setEnquiries(enquiryRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user.token]);

  // Statistics
  const stats = useMemo(() => {
    const totalEnquiries = enquiries.length;
    const convertedCount = enquiries.filter(e => e.status === 'Converted').length;
    const conversionRate = totalEnquiries > 0 ? Math.round((convertedCount / totalEnquiries) * 100) : 0;
    
    return {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'Active').length,
      totalEnquiries,
      conversionRate
    };
  }, [students, enquiries]);

  // Domain Distribution based on active tab
  const domainData = useMemo(() => {
    const counts = {};
    PRESET_DOMAINS.forEach(d => { counts[d] = 0; });

    const sourceData = activeTab === 'interns' ? students : enquiries;

    sourceData.forEach(item => {
      if (item.domain) {
        counts[item.domain] = (counts[item.domain] || 0) + 1;
      }
    });

    return Object.keys(counts).map(domain => ({
      name: domain,
      count: counts[domain] || 0
    }));
  }, [students, enquiries, activeTab]);

  const maxCount = useMemo(() => {
    const counts = domainData.map(d => d.count);
    return Math.max(...counts, 1);
  }, [domainData]);

  // Records for selected domain modal
  const selectedDomainItems = useMemo(() => {
    if (!selectedDomainModal) return [];
    if (activeTab === 'interns') {
      return students.filter(s => s.domain === selectedDomainModal);
    } else {
      return enquiries.filter(e => e.domain === selectedDomainModal);
    }
  }, [selectedDomainModal, activeTab, students, enquiries]);

  const colors = [
    'linear-gradient(135deg, #0078d4 0%, #00bcd4 100%)',
    'linear-gradient(135deg, #107c41 0%, #27b662 100%)',
    'linear-gradient(135deg, #d83b01 0%, #ff8c00 100%)',
    'linear-gradient(135deg, #5c2d91 0%, #b4009e 100%)',
    'linear-gradient(135deg, #008272 0%, #00b7c3 100%)',
    'linear-gradient(135deg, #e3008c 0%, #ff68b4 100%)',
    'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)'
  ];

  return (
    <div style={{ fontFamily: 'Inter, Segoe UI, sans-serif' }}>
      {/* Top Header & Quick Actions */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Dashboard</h1>
          <p style={{ color: '#64748b', marginTop: '0.2rem', fontSize: '0.85rem' }}>
            Welcome back, {user.role === 'ADMIN' ? 'Mrs. Daljeet Paul' : 'Developer'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={() => navigate('/enquiries')}
          >
            <HelpCircle size={16} style={{ marginRight: '0.4rem' }} />
            View Enquiries
          </button>
          <button 
            className="btn btn-primary" 
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={() => navigate('/students')}
          >
            <Users size={16} style={{ marginRight: '0.4rem' }} />
            Manage Students
          </button>
        </div>
      </div>
      
      {/* 4 Compact Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ background: 'rgba(0, 120, 212, 0.1)', padding: '0.75rem', borderRadius: '10px', color: '#0078d4' }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Total Interns</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>{stats.totalStudents}</div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '10px', color: '#059669' }}>
            <Activity size={22} />
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Active Interns</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>{stats.activeStudents}</div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '10px', color: '#d97706' }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Enquiries</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>{stats.totalEnquiries}</div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '10px', color: '#7c3aed' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Conversion Rate</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>{stats.conversionRate}%</div>
          </div>
        </div>

      </div>

      {/* Main 2-Column Compact Layout */}
      <div className="dashboard-grid">
        
        {/* Left Column: Interactive Domain Distribution Bar Chart */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>Domain Distribution</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Click any domain bar to inspect registered records</span>
            </div>
            
            {/* Interactive Tab Switcher */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button 
                onClick={() => setActiveTab('interns')}
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'interns' ? '#ffffff' : 'transparent',
                  color: activeTab === 'interns' ? '#0078d4' : '#64748b',
                  boxShadow: activeTab === 'interns' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Interns
              </button>
              <button 
                onClick={() => setActiveTab('enquiries')}
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'enquiries' ? '#ffffff' : 'transparent',
                  color: activeTab === 'enquiries' ? '#0078d4' : '#64748b',
                  boxShadow: activeTab === 'enquiries' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Enquiries
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {domainData.map((item, index) => {
              const percentage = maxCount > 0 && item.count > 0 ? Math.round((item.count / maxCount) * 100) : 0;
              const isHovered = hoveredBar === index;
              
              return (
                <div 
                  key={item.name}
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                  onClick={() => setSelectedDomainModal(item.name)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    background: isHovered ? '#f1f5f9' : 'transparent',
                    transition: 'background 0.2s ease',
                    cursor: 'pointer'
                  }}
                  title="Click to view details"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                    <span style={{ color: isHovered ? '#0078d4' : '#334155', fontWeight: isHovered ? 600 : 500, transition: 'color 0.2s' }}>
                      {item.name}
                    </span>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>
                      {item.count} {activeTab === 'interns' ? (item.count === 1 ? 'Intern' : 'Interns') : (item.count === 1 ? 'Enquiry' : 'Enquiries')}
                    </span>
                  </div>

                  <div style={{ 
                    height: '7px', 
                    width: '100%', 
                    background: '#e2e8f0', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${item.count > 0 ? percentage : 2}%`,
                      background: colors[index % colors.length],
                      borderRadius: '4px',
                      opacity: item.count > 0 ? 1 : 0.4,
                      transition: 'width 0.8s cubic-bezier(0.1, 0.9, 0.2, 1)',
                      boxShadow: isHovered ? '0 0 10px rgba(0, 120, 212, 0.4)' : 'none'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quick Recent Activity Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 600 }}>Recent Enquiries</h4>
              <button 
                onClick={() => navigate('/enquiries')}
                style={{ background: 'none', border: 'none', color: '#0078d4', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                View all <ArrowUpRight size={14} />
              </button>
            </div>

            {enquiries.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>
                No enquiries recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {enquiries.slice(0, 4).map(enquiry => (
                  <div key={enquiry._id || enquiry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{enquiry.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{enquiry.domain}</div>
                    </div>
                    <span className="badge" style={{
                      fontSize: '0.65rem',
                      background: enquiry.status === 'Converted' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: enquiry.status === 'Converted' ? '#059669' : '#d97706'
                    }}>
                      {enquiry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 120, 212, 0.05) 0%, rgba(0, 188, 212, 0.05) 100%)',
            borderRadius: '14px',
            padding: '1.25rem',
            border: '1px solid rgba(0, 120, 212, 0.2)',
            boxShadow: '0 2px 10px rgba(0, 120, 212, 0.05)'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0078d4', fontWeight: 600, marginBottom: '0.4rem' }}>Interactive Feature</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
              Use the <b>Interns / Enquiries</b> toggle above the chart, or click directly on any domain row to inspect students!
            </p>
          </div>

        </div>

      </div>

      {/* Interactive Click Detail Modal */}
      {selectedDomainModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{selectedDomainModal}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {activeTab === 'interns' ? 'Enrolled Interns' : 'Student Enquiries'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedDomainModal(null)} 
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectedDomainItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No records found under {selectedDomainModal}.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedDomainItems.map((item) => (
                    <div key={item._id || item.id} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.email || item.phone || 'No contact'}</div>
                      </div>
                      <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                        {item.status || 'Enrolled'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

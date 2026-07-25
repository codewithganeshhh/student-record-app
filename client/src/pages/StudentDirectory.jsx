import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Search, Plus, Edit, Trash2, FileSpreadsheet, Award } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { exportToExcel } from '../utils/exportToExcel';
import CertificateModal from '../components/CertificateModal';

const PRESET_DOMAINS = [
  'MERN stack', 
  'Full stack (DJANGO)', 
  'FULL STACK PHP', 
  'WEB DESIGN', 
  'Data Analytics', 
  'DATA Science', 
  'AI/ML'
];

export default function StudentDirectory({ user }) {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('MERN stack');
  const [customDomain, setCustomDomain] = useState('');
  const [selectedStudentForCertificate, setSelectedStudentForCertificate] = useState(null);

  // Prefill state if converted from Enquiry navigation
  const [prefilledData, setPrefilledData] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    // Check if navigated from Enquiry Convert action
    if (location.state?.prefillEnquiry) {
      const enquiry = location.state.prefillEnquiry;
      setEditingStudent(null);
      setPrefilledData(enquiry);
      const isPreset = PRESET_DOMAINS.includes(enquiry.domain);
      setSelectedDomain(isPreset ? enquiry.domain : 'Other');
      setCustomDomain(isPreset ? '' : enquiry.domain || '');
      setShowModal(true);
    }
  }, [user.token, location.state]);

  const allKnownDomains = useMemo(() => {
    const customSet = new Set(PRESET_DOMAINS);
    students.forEach(s => s.domain && customSet.add(s.domain));
    return ['All', ...Array.from(customSet)];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email?.toLowerCase().includes(search.toLowerCase());
      const matchDomain = domainFilter === 'All' || s.domain === domainFilter;
      return matchSearch && matchDomain;
    });
  }, [students, search, domainFilter]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setPrefilledData(null);
    setSelectedDomain('MERN stack');
    setCustomDomain('');
    setShowModal(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setPrefilledData(null);
    const isPreset = PRESET_DOMAINS.includes(student.domain);
    setSelectedDomain(isPreset ? student.domain : 'Other');
    setCustomDomain(isPreset ? '' : student.domain);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/students/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchStudents();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (selectedDomain === 'Other') {
      if (!customDomain.trim()) {
        alert('Please specify the custom domain');
        return;
      }
      data.domain = customDomain.trim();
    } else {
      data.domain = selectedDomain;
    }
    delete data.custom_domain;
    data.sendWelcomeEmail = data.sendWelcomeEmail === 'on';

    try {
      if (editingStudent) {
        await axios.put(`${API_BASE_URL}/api/students/${editingStudent._id || editingStudent.id}`, data, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/students`, data, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      alert('Error saving student');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ margin: 0 }}>Student Directory</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.9rem' }}>
            Registered Interns & Active Student Management
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary" 
            style={{ color: '#107c41', borderColor: '#107c41' }}
            onClick={() => {
              const cols = [
                { label: 'Name', key: 'name' },
                { label: 'Email', key: 'email' },
                { label: 'Phone', key: 'phone' },
                { label: 'Domain', key: 'domain' },
                { label: 'Joining Date', key: 'joining_date' },
                { label: 'Duration (Months)', key: 'duration' },
                { label: 'Status', key: 'status' }
              ];
              exportToExcel(filteredStudents, cols, 'Students_Directory');
            }}
          >
            <FileSpreadsheet size={18} style={{ marginRight: '0.5rem' }} />
            Export Excel
          </button>
          {user.role === 'ADMIN' && (
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} style={{ marginRight: '0.5rem' }} />
              Add Intern
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel p-6 mb-6">
        <div className="flex gap-4">
          <div className="input-group" style={{ flex: 1, margin: 0, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '0.85rem', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <div className="input-group" style={{ margin: 0, width: '250px' }}>
            <select 
              className="input-field"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            >
              {allKnownDomains.map(d => <option key={d} value={d} style={{ background: 'var(--bg-secondary)' }}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Joining Date</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={user.role === 'ADMIN' ? 6 : 5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No interns found.
                </td>
              </tr>
            ) : filteredStudents.map(student => (
              <tr key={student._id || student.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{student.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.email || student.phone || 'No contact'}</div>
                </td>
                <td><span className="badge badge-domain">{student.domain}</span></td>
                <td>{new Date(student.joining_date).toLocaleDateString()}</td>
                <td>{student.duration} months</td>
                <td>
                  <span className={student.status === 'Active' ? 'badge badge-active' : 'badge'} style={{ background: student.status !== 'Active' ? '#f1f5f9' : '', color: student.status !== 'Active' ? '#64748b' : '', border: student.status !== 'Active' ? '1px solid #cbd5e1' : '' }}>
                    {student.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }} 
                      title="Generate Certificate"
                      onClick={() => setSelectedStudentForCertificate(student)}
                    >
                      <Award size={16} />
                    </button>
                    {user.role === 'ADMIN' && (
                      <>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleOpenEdit(student)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(student._id || student.id)}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div className="glass-panel p-6" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="mb-4">{editingStudent ? 'Edit Intern' : prefilledData ? 'Enroll Converted Enquiry' : 'Add New Intern'}</h2>
            <form onSubmit={handleSave} className="flex-col gap-4">
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Name</label>
                <input type="text" name="name" className="input-field" defaultValue={editingStudent?.name || prefilledData?.name} required />
              </div>
              
              <div className="flex gap-4">
                <div className="input-group" style={{ margin: 0, flex: 1 }}>
                  <label className="input-label">Email</label>
                  <input type="email" name="email" className="input-field" defaultValue={editingStudent?.email || prefilledData?.email} />
                </div>
                <div className="input-group" style={{ margin: 0, flex: 1 }}>
                  <label className="input-label">Phone</label>
                  <input type="text" name="phone" className="input-field" defaultValue={editingStudent?.phone || prefilledData?.phone} />
                </div>
              </div>

              {/* Domain Dropdown with "Other" Support */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Domain</label>
                <select 
                  className="input-field" 
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  {PRESET_DOMAINS.map(d => (
                    <option key={d} value={d} style={{ background: 'var(--bg-secondary)' }}>{d}</option>
                  ))}
                  <option value="Other" style={{ background: 'var(--bg-secondary)' }}>Other (Type Custom Domain)...</option>
                </select>
              </div>

              {selectedDomain === 'Other' && (
                <div className="input-group animate-fade-in" style={{ margin: 0 }}>
                  <label className="input-label" style={{ color: 'var(--accent-primary)' }}>Custom Domain Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Enter custom domain name..." 
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="flex gap-4">
                <div className="input-group" style={{ margin: 0, flex: 1 }}>
                  <label className="input-label">Joining Date</label>
                  <input type="date" name="joining_date" className="input-field" 
                         defaultValue={editingStudent?.joining_date ? new Date(editingStudent.joining_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="input-group" style={{ margin: 0, flex: 1 }}>
                  <label className="input-label">Duration (Months)</label>
                  <input type="number" name="duration" className="input-field" defaultValue={editingStudent?.duration || 3} required min="1" />
                </div>
              </div>

              {editingStudent && (
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Status</label>
                  <select name="status" className="input-field" defaultValue={editingStudent.status}>
                    <option value="Active" style={{ background: 'var(--bg-secondary)' }}>Active</option>
                    <option value="Completed" style={{ background: 'var(--bg-secondary)' }}>Completed</option>
                  </select>
                </div>
              )}

              {!editingStudent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.8rem' }}>
                  <input 
                    type="checkbox" 
                    id="sendWelcomeEmail" 
                    name="sendWelcomeEmail" 
                    defaultChecked={true}
                    style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                  />
                  <label htmlFor="sendWelcomeEmail" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                    Send welcome email with internship details
                  </label>
                </div>
              )}
              
              <div className="flex justify-between mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Intern</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudentForCertificate && (
        <CertificateModal 
          student={selectedStudentForCertificate} 
          onClose={() => setSelectedStudentForCertificate(null)}
          onUpdate={(updatedStudent) => {
            setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
            setSelectedStudentForCertificate(updatedStudent);
          }}
        />
      )}
    </div>
  );
}

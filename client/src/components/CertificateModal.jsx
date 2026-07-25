import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { API_BASE_URL } from '../config';

export default function CertificateModal({ student, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Format Date to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Helper to format date as "11th May 2026"
  const formatDateString = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    // Get ordinal suffix (st, nd, rd, th)
    const getOrdinal = (n) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinal(day)} ${month} ${year}`;
  };

  // Helper to format date as DD/MM/YYYY
  const formatDateDDMMYYYY = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Default values
  const defaultStartDate = formatDateForInput(student.joining_date);
  
  // Calculate default End Date (Start Date + Duration months)
  const getDefaultEndDate = () => {
    if (!student.joining_date) return '';
    const date = new Date(student.joining_date);
    date.setMonth(date.getMonth() + (student.duration || 1));
    return date.toISOString().split('T')[0];
  };

  // Generate a random certificate number if not exists
  const generateCertificateNo = () => {
    const random = Math.floor(100 + Math.random() * 900); // 3 digit random
    const year = new Date().getFullYear();
    return `PSS/${random}/${year}`;
  };

  // Form State
  const [formData, setFormData] = useState({
    certificateNo: student.certificate?.certificateNo || generateCertificateNo(),
    startDate: student.certificate?.startDate ? formatDateForInput(student.certificate.startDate) : defaultStartDate,
    endDate: student.certificate?.endDate ? formatDateForInput(student.certificate.endDate) : getDefaultEndDate(),
    issueDate: student.certificate?.issueDate ? formatDateForInput(student.certificate.issueDate) : formatDateForInput(new Date())
  });

  // Position settings (percentages) to align text precisely onto the template
  const [positions, setPositions] = useState({
    nameTop: 52.5,
    nameFontSize: 30,
    domainTop: 71.0,
    domainLeft: 10.5,
    domainWidth: 35.0,
    domainFontSize: 16,
    datesTop: 71.0,
    datesLeft: 53.5,
    datesWidth: 40.0,
    datesFontSize: 14,
    certNoTop: 83.5,
    certNoLeft: 45.0,
    certNoWidth: 22.0,
    certNoFontSize: 16,
    issueDateTop: 89.2,
    issueDateLeft: 3.5,
    issueDateWidth: 20.0,
    issueDateFontSize: 16
  });

  const [activeTab, setActiveTab] = useState('name');

  const certificateRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (key, val) => {
    setPositions(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  const saveCertificateDetails = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_BASE_URL}/api/students/${student.id}/certificate`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(res.data);
    } catch (err) {
      console.error('Error saving certificate:', err);
      alert('Failed to save certificate details');
    } finally {
      setSaving(false);
    }
  };

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    setLoading(true);

    try {
      // First save details to database
      await saveCertificateDetails();

      // Render certificate element to canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.5, // High resolution scale for printing
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for A4 Landscape
      // A4 dimensions in px at 72 dpi: 842 x 595
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${student.name.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
    }}>
      <div className="glass-panel p-6" style={{ maxWidth: '1100px', width: '95%', maxHeight: '95vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
          <h3 style={{ margin: 0 }}>Generate Certificate - {student.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          
          {/* Controls Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.8rem', color: 'var(--primary)' }}>Certificate Info</h4>
              <div className="input-group">
                <label className="input-label">Certificate No.</label>
                <input 
                  type="text" 
                  name="certificateNo" 
                  className="input-field" 
                  value={formData.certificateNo} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Start Date</label>
                <input 
                  type="date" 
                  name="startDate" 
                  className="input-field" 
                  value={formData.startDate} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="input-group">
                <label className="input-label">End Date</label>
                <input 
                  type="date" 
                  name="endDate" 
                  className="input-field" 
                  value={formData.endDate} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Issue Date</label>
                <input 
                  type="date" 
                  name="issueDate" 
                  className="input-field" 
                  value={formData.issueDate} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            {/* Position Adjustments (Pro Tuning) */}
            <div className="form-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <h4 style={{ marginBottom: '0.8rem', color: 'var(--primary)' }}>Align Text Overlays</h4>
              
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                {['name', 'domain', 'dates', 'certNo', 'issueDate'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '4px 8px',
                      background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                      color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {tab === 'name' ? 'Name' : tab === 'domain' ? 'Domain' : tab === 'dates' ? 'Dates' : tab === 'certNo' ? 'Cert No' : 'Date'}
                  </button>
                ))}
              </div>

              {activeTab === 'name' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <strong>Top (%):</strong>
                    <input type="range" min="40" max="65" step="0.1" value={positions.nameTop} onChange={(e) => handlePositionChange('nameTop', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Font Size (px):</strong>
                    <input type="range" min="20" max="50" step="1" value={positions.nameFontSize} onChange={(e) => handlePositionChange('nameFontSize', e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {activeTab === 'domain' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <strong>Top (%):</strong>
                    <input type="range" min="60" max="85" step="0.1" value={positions.domainTop} onChange={(e) => handlePositionChange('domainTop', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Left (%):</strong>
                    <input type="range" min="5" max="50" step="0.1" value={positions.domainLeft} onChange={(e) => handlePositionChange('domainLeft', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Width (%):</strong>
                    <input type="range" min="10" max="60" step="0.1" value={positions.domainWidth} onChange={(e) => handlePositionChange('domainWidth', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Font Size (px):</strong>
                    <input type="range" min="12" max="30" step="1" value={positions.domainFontSize} onChange={(e) => handlePositionChange('domainFontSize', e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {activeTab === 'dates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <strong>Top (%):</strong>
                    <input type="range" min="60" max="85" step="0.1" value={positions.datesTop} onChange={(e) => handlePositionChange('datesTop', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Left (%):</strong>
                    <input type="range" min="40" max="80" step="0.1" value={positions.datesLeft} onChange={(e) => handlePositionChange('datesLeft', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Width (%):</strong>
                    <input type="range" min="10" max="60" step="0.1" value={positions.datesWidth} onChange={(e) => handlePositionChange('datesWidth', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Font Size (px):</strong>
                    <input type="range" min="10" max="25" step="1" value={positions.datesFontSize} onChange={(e) => handlePositionChange('datesFontSize', e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {activeTab === 'certNo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <strong>Top (%):</strong>
                    <input type="range" min="75" max="95" step="0.1" value={positions.certNoTop} onChange={(e) => handlePositionChange('certNoTop', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Left (%):</strong>
                    <input type="range" min="20" max="70" step="0.1" value={positions.certNoLeft} onChange={(e) => handlePositionChange('certNoLeft', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Width (%):</strong>
                    <input type="range" min="10" max="50" step="0.1" value={positions.certNoWidth} onChange={(e) => handlePositionChange('certNoWidth', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Font Size (px):</strong>
                    <input type="range" min="12" max="25" step="1" value={positions.certNoFontSize} onChange={(e) => handlePositionChange('certNoFontSize', e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {activeTab === 'issueDate' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <strong>Top (%):</strong>
                    <input type="range" min="75" max="95" step="0.1" value={positions.issueDateTop} onChange={(e) => handlePositionChange('issueDateTop', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Left (%):</strong>
                    <input type="range" min="1" max="40" step="0.1" value={positions.issueDateLeft} onChange={(e) => handlePositionChange('issueDateLeft', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Width (%):</strong>
                    <input type="range" min="10" max="40" step="0.1" value={positions.issueDateWidth} onChange={(e) => handlePositionChange('issueDateWidth', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <strong>Font Size (px):</strong>
                    <input type="range" min="12" max="25" step="1" value={positions.issueDateFontSize} onChange={(e) => handlePositionChange('issueDateFontSize', e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={saveCertificateDetails} 
                disabled={saving}
                style={{ flex: 1 }}
              >
                {saving ? 'Saving...' : 'Save Details'}
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={downloadPDF} 
                disabled={loading}
                style={{ flex: 1.5 }}
              >
                {loading ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
          </div>

          {/* Interactive Preview Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div 
              ref={certificateRef}
              style={{
                position: 'relative',
                width: '650px',
                height: '504px',
                backgroundImage: 'url("/certificate-template.png")',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                borderRadius: '4px',
                overflow: 'hidden',
                color: '#0f2d4a',
                fontFamily: '"Montserrat", "Arial", sans-serif'
              }}
            >
              {/* Student Name */}
              <div 
                style={{
                  position: 'absolute',
                  top: `${positions.nameTop}%`,
                  left: 0,
                  width: '100%',
                  textAlign: 'center',
                  fontWeight: '800',
                  fontSize: `${positions.nameFontSize}px`,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  pointerEvents: 'none'
                }}
              >
                {student.name}
              </div>

              {/* Domain */}
              <div 
                style={{
                  position: 'absolute',
                  top: `${positions.domainTop}%`,
                  left: `${positions.domainLeft}%`,
                  width: `${positions.domainWidth}%`,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: `${positions.domainFontSize}px`,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  pointerEvents: 'none'
                }}
              >
                {student.domain}
              </div>

              {/* Dates */}
              <div 
                style={{
                  position: 'absolute',
                  top: `${positions.datesTop}%`,
                  left: `${positions.datesLeft}%`,
                  width: `${positions.datesWidth}%`,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: `${positions.datesFontSize}px`,
                  pointerEvents: 'none'
                }}
              >
                {formatDateString(formData.startDate)} – {formatDateString(formData.endDate)}
              </div>

              {/* Certificate Number */}
              <div 
                style={{
                  position: 'absolute',
                  top: `${positions.certNoTop}%`,
                  left: `${positions.certNoLeft}%`,
                  width: `${positions.certNoWidth}%`,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: `${positions.certNoFontSize}px`,
                  letterSpacing: '0.5px',
                  pointerEvents: 'none'
                }}
              >
                {formData.certificateNo}
              </div>

              {/* Issue Date */}
              <div 
                style={{
                  position: 'absolute',
                  top: `${positions.issueDateTop}%`,
                  left: `${positions.issueDateLeft}%`,
                  width: `${positions.issueDateWidth}%`,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: `${positions.issueDateFontSize}px`,
                  letterSpacing: '0.5px',
                  pointerEvents: 'none'
                }}
              >
                {formatDateDDMMYYYY(formData.issueDate)}
              </div>
            </div>
            <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Live certificate layout preview. Drag sliders to adjust text positioning to perfectly align with lines.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

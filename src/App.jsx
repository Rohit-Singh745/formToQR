import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import './App.css'

// Form to QR code converter application
function App() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    designation: '',
    companyName: '',
    email: '',
    employeeId: '',
    website: ''
  })

  const [showQR, setShowQR] = useState(false)
  const [qrValue, setQrValue] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Real-time validation for individual fields
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return ''
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name should only contain letters'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        return ''

      case 'contact':
        if (!value.trim()) return ''
        if (!/^[0-9+\-\s()]+$/.test(value)) return 'Please enter a valid contact number'
        if (value.replace(/\D/g, '').length > 0 && value.replace(/\D/g, '').length < 10) return 'Contact must be at least 10 digits'
        return ''

      case 'designation':
        if (!value.trim()) return ''
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Designation should only contain letters'
        return ''

      case 'companyName':
        if (!value.trim()) return ''
        if (!/[a-zA-Z]/.test(value)) return 'Company name must contain at least one letter'
        if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(value)) return 'Please enter a valid company name'
        return ''

      case 'email':
        if (!value.trim()) return ''
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'Please enter a valid email'
        const emailParts = value.split('@')
        if (emailParts.length === 2) {
          const domain = emailParts[1]
          const domainParts = domain.split('.')
          const tld = domainParts[domainParts.length - 1]
          if (tld.length < 2 || domainParts[0].length < 2) return 'Please enter a valid email domain'
        }
        return ''

      case 'employeeId':
        if (!value.trim()) return ''
        if (!/^[a-zA-Z0-9-]+$/.test(value)) return 'Employee ID should be alphanumeric'
        return ''

      case 'website':
        if (!value.trim()) return ''
        if (!/^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/.test(value)) return 'Please enter a valid URL (e.g., synexera.com)'
        return ''

      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Real-time validation
    const fieldError = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation - only letters and spaces allowed
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name should only contain letters'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Contact validation - only numbers, +, -, spaces, parentheses
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact is required'
    } else if (!/^[0-9+\-\s()]+$/.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid contact number'
    } else if (formData.contact.replace(/\D/g, '').length < 10) {
      newErrors.contact = 'Contact must be at least 10 digits'
    }

    // Designation validation - only letters and spaces
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required'
    } else if (!/^[a-zA-Z\s]+$/.test(formData.designation)) {
      newErrors.designation = 'Designation should only contain letters'
    }

    // Company name validation - must contain at least one letter
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    } else if (!/[a-zA-Z]/.test(formData.companyName)) {
      newErrors.companyName = 'Company name must contain at least one letter'
    } else if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(formData.companyName)) {
      newErrors.companyName = 'Please enter a valid company name'
    }

    // Email validation - stricter format with proper domain
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    } else {
      // Additional check: domain must have at least 2 parts and TLD must be valid length
      const emailParts = formData.email.split('@')
      const domain = emailParts[1]
      const domainParts = domain.split('.')
      const tld = domainParts[domainParts.length - 1]
      if (tld.length < 2 || domainParts[0].length < 2) {
        newErrors.email = 'Please enter a valid email domain'
      }
    }

    // Employee ID validation - alphanumeric
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required'
    } else if (!/^[a-zA-Z0-9-]+$/.test(formData.employeeId)) {
      newErrors.employeeId = 'Employee ID should be alphanumeric'
    }

    // Website validation - allows domain.com without https://
    if (!formData.website.trim()) {
      newErrors.website = 'Website is required'
    } else if (!/^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (e.g., synexera.com)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Generate QR data in vCard format for universal scanner compatibility
      // N field format: LastName;FirstName;MiddleName;Prefix;Suffix
      const nameParts = formData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      let qrData = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${formData.name}
TEL:${formData.contact}
TITLE:${formData.designation}
ORG:${formData.companyName}
EMAIL:${formData.email}
NOTE:Employee ID: ${formData.employeeId}`

      // Add website if provided
      if (formData.website.trim()) {
        qrData += `\nURL:${formData.website}`
      }

      qrData += `\nEND:VCARD`

      // Simulate a brief delay for animation effect
      setTimeout(() => {
        setQrValue(qrData)
        setShowQR(true)
        setIsSubmitting(false)
      }, 500)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      contact: '',
      designation: '',
      companyName: '',
      email: '',
      employeeId: '',
      website: ''
    })
    setShowQR(false)
    setQrValue('')
    setErrors({})
  }

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code')
    if (canvas) {
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `${formData.name.replace(/\s+/g, '_')}_QR.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">QR<span>Gen</span></h1>
          <p className="header-subtitle">Employee Card Generator</p>
        </div>
      </header>

      {/* Security Banner */}
      <div className="security-banner">
        <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>Your data is secure and only used for QR generation</span>
      </div>

      <main className="main-content">
        <div className="container">
          <h2 className="page-title">Generate Your Employee QR Code</h2>

          <div className="content-wrapper">
            {/* Form Section */}
            <div className="form-section">
              <div className="card">
                <h3 className="card-title">Employee Details</h3>

                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={errors.name ? 'error' : formData.name ? 'valid' : ''}
                      />
                      {errors.name && <span className="error-text">{errors.name}</span>}
                      {formData.name && !errors.name && <span className="check-icon">✓</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact">Contact Number</label>
                      <input
                        type="tel"
                        id="contact"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        placeholder="Enter contact number"
                        className={errors.contact ? 'error' : formData.contact ? 'valid' : ''}
                      />
                      {errors.contact && <span className="error-text">{errors.contact}</span>}
                      {formData.contact && !errors.contact && <span className="check-icon">✓</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="designation">Designation</label>
                      <input
                        type="text"
                        id="designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Enter your designation"
                        className={errors.designation ? 'error' : formData.designation ? 'valid' : ''}
                      />
                      {errors.designation && <span className="error-text">{errors.designation}</span>}
                      {formData.designation && !errors.designation && <span className="check-icon">✓</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="companyName">Company Name</label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className={errors.companyName ? 'error' : formData.companyName ? 'valid' : ''}
                      />
                      {errors.companyName && <span className="error-text">{errors.companyName}</span>}
                      {formData.companyName && !errors.companyName && <span className="check-icon">✓</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={errors.email ? 'error' : formData.email ? 'valid' : ''}
                      />
                      {errors.email && <span className="error-text">{errors.email}</span>}
                      {formData.email && !errors.email && <span className="check-icon">✓</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="employeeId">Employee ID</label>
                      <input
                        type="text"
                        id="employeeId"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="Enter employee ID"
                        className={errors.employeeId ? 'error' : formData.employeeId ? 'valid' : ''}
                      />
                      {errors.employeeId && <span className="error-text">{errors.employeeId}</span>}
                      {formData.employeeId && !errors.employeeId && <span className="check-icon">✓</span>}
                    </div>
                  </div>

                  <div className="form-row single">
                    <div className="form-group">
                      <label htmlFor="website">Website</label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="synexera.com or https://synexera.com"
                        className={errors.website ? 'error' : formData.website ? 'valid' : ''}
                      />
                      {errors.website && <span className="error-text">{errors.website}</span>}
                      {formData.website && !errors.website && <span className="check-icon">✓</span>}
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      type="submit"
                      className={`btn btn-primary ${isSubmitting ? 'loading' : ''} ${showQR ? 'disabled' : ''}`}
                      disabled={isSubmitting || showQR}
                    >
                      {isSubmitting ? (
                        <span className="spinner"></span>
                      ) : (
                        <>
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                          </svg>
                          {showQR ? 'QR Generated' : 'Generate QR Code'}
                        </>
                      )}
                    </button>

                    {showQR && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleReset}
                      >
                        Reset Form
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* QR Code Section */}
            <div className={`qr-section ${showQR ? 'show' : ''}`}>
              <div className="card qr-card">
                <div className="qr-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  QR Generated Successfully
                </div>

                <div className="qr-preview">
                  {showQR && qrValue && (
                    <div className="qr-container">
                      <QRCodeCanvas
                        id="qr-code"
                        value={qrValue}
                        size={200}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                      <div className="qr-data-preview">
                        <strong>Employee Details</strong>
                        <div className="encoded-data-list">
                          <div><span>Full Name:</span> {formData.name}</div>
                          <div><span>Phone No:</span> {formData.contact}</div>
                          <div><span>Designation:</span> {formData.designation}</div>
                          <div><span>Company:</span> {formData.companyName}</div>
                          <div><span>Email:</span> {formData.email}</div>
                          <div><span>Employee ID:</span> {formData.employeeId}</div>
                          <div><span>Website:</span> {formData.website}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {showQR && (
                  <>
                    <button className="btn btn-download" onClick={downloadQR}>
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download QR Code
                    </button>
                  </>
                )}

                {!showQR && (
                  <div className="qr-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    <p>Fill in the form and click generate to create your QR code</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 QRGen. All rights reserved.</p>
          <p className="footer-note">Scan the generated QR code with any QR scanner to view employee details</p>
        </div>
      </footer>
    </div>
  )
}

export default App

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('./db');
const User = require('./models/User');
const Student = require('./models/Student');
const Enquiry = require('./models/Enquiry');

const app = express();
app.use(cors());
app.use(express.json());

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'Student Record App API is running!' });
});


// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

// Seed default users if they don't exist
const seedUsers = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const adminHash = await bcrypt.hash('admin123', 10);
      await User.create({ username: 'admin', password_hash: adminHash, role: 'ADMIN' });
      console.log('Seeded default admin user');
    }
    
    const devExists = await User.findOne({ username: 'dev' });
    if (!devExists) {
      const devHash = await bcrypt.hash('dev123', 10);
      await User.create({ username: 'dev', password_hash: devHash, role: 'DEVELOPER' });
      console.log('Seeded default dev user');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};
seedUsers();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all students (Admin & Developer)
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find().sort({ joining_date: -1 });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new student (Admin only)
app.post('/api/students', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can add students' });
  }
  
  try {
    const { sendWelcomeEmail: shouldSendEmail, ...studentData } = req.body;
    const student = await Student.create(studentData);
    
    // Respond back to frontend immediately
    res.status(201).json(student);

    // Trigger welcome email in the background
    console.log(`Add Intern API: Intern created successfully. shouldSendEmail=${shouldSendEmail}, email=${student.email}`);
    if (shouldSendEmail && student.email) {
      const { sendWelcomeEmail } = require('./utils/mailer');
      sendWelcomeEmail(student).then(res => {
        console.log(`Welcome email result for ${student.email}:`, res);
      }).catch(err => {
        console.error('Failed to send welcome email in background:', err);
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a student (Admin only)
app.put('/api/students/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can update students' });
  }
  
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update student certificate details (Admin & Developer)
app.put('/api/students/:id/certificate', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: { certificate: req.body } },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a student (Admin only)
app.delete('/api/students/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can delete students' });
  }
  
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Enquiry Routes ---

// Get all enquiries (Admin & Developer)
app.get('/api/enquiries', authenticateToken, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ enquiry_date: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new enquiry (Admin & Developer)
app.post('/api/enquiries', authenticateToken, async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json(enquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update an enquiry (Admin only)
app.put('/api/enquiries/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can update enquiries' });
  }
  
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    res.json(enquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an enquiry (Admin only)
app.delete('/api/enquiries/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can delete enquiries' });
  }
  
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    res.json({ message: 'Enquiry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

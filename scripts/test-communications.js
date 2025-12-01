import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_BASE_URL = 'http://localhost:3000/api';

// Generate a test JWT token (replace with actual user ID from your database)
const generateTestToken = () => {
  const payload = {
    userId: 'YOUR_TEST_USER_ID', // Replace with actual user ID
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const testToken = generateTestToken();
const config = {
  headers: {
    Authorization: `Bearer ${testToken}`,
  },
};

// Test data
const testTenantId = 'YOUR_TEST_TENANT_ID'; // Replace with actual tenant ID

const testCreateCommunication = async () => {
  try {
    const newComm = {
      tenantId: testTenantId,
      type: 'email',
      channel: 'Email',
      summary: 'Test communication',
      content: 'This is a test communication',
      followUpRequired: true,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    console.log('Creating communication...');
    const response = await axios.post(
      `${API_BASE_URL}/communications`,
      newComm,
      config
    );
    console.log('Create Communication Response:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('Error creating communication:', error.response?.data || error.message);
  }
};

const testGetCommunications = async () => {
  try {
    console.log('Fetching communications...');
    const response = await axios.get(
      `${API_BASE_URL}/communications/tenants/${testTenantId}/communications`,
      config
    );
    console.log('Get Communications Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching communications:', error.response?.data || error.message);
  }
};

const testUpdateCommunication = async (commId) => {
  try {
    const updateData = {
      summary: 'Updated test communication',
      content: 'This is an updated test communication',
      followUpRequired: false,
    };

    console.log('Updating communication...');
    const response = await axios.put(
      `${API_BASE_URL}/communications/${commId}`,
      updateData,
      config
    );
    console.log('Update Communication Response:', response.data);
  } catch (error) {
    console.error('Error updating communication:', error.response?.data || error.message);
  }
};

const testDeleteCommunication = async (commId) => {
  try {
    console.log('Deleting communication...');
    await axios.delete(`${API_BASE_URL}/communications/${commId}`, config);
    console.log('Communication deleted successfully');
  } catch (error) {
    console.error('Error deleting communication:', error.response?.data || error.message);
  }
};

// Run tests
const runTests = async () => {
  try {
    // Test create
    const commId = await testCreateCommunication();
    
    if (commId) {
      // Test get all
      await testGetCommunications();
      
      // Test update
      await testUpdateCommunication(commId);
      
      // Test delete (uncomment to test deletion)
      // await testDeleteCommunication(commId);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

runTests();

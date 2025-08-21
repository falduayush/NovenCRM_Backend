const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('Connection URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-crm');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-crm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    
    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Database Collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Count documents in each collection
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  📈 ${collection.name}: ${count} documents`);
    }
    
    // Show sample data
    console.log('\n📋 Sample Data:');
    
    // Sample templates
    const templates = await db.collection('templates').find().limit(3).toArray();
    if (templates.length > 0) {
      console.log('\n📝 Sample Templates:');
      templates.forEach((template, index) => {
        console.log(`  ${index + 1}. ${template.name} (${template.category})`);
      });
    }
    
    // Sample contacts
    const contacts = await db.collection('data').find().limit(3).toArray();
    if (contacts.length > 0) {
      console.log('\n👥 Sample Contacts:');
      contacts.forEach((contact, index) => {
        console.log(`  ${index + 1}. ${contact.name} - ${contact.phone}`);
      });
    }
    
    if (templates.length === 0 && contacts.length === 0) {
      console.log('\n⚠️  No data found. Your database is empty.');
      console.log('   Try creating some templates or importing contacts first!');
    }
    
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your MONGODB_URI in .env file');
    console.log('   2. Make sure MongoDB Atlas is accessible');
    console.log('   3. Verify your username/password');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testConnection();



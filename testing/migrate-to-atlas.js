const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Local MongoDB connection
const localUri = 'mongodb://localhost:27017/whatsapp-crm';
// Atlas MongoDB connection
const atlasUri = 'mongodb+srv://Mihir:Mihir123@noven.p4qjkrd.mongodb.net/whatsapp-crm?retryWrites=true&w=majority';

async function migrateData() {
  let localConnection, atlasConnection;
  
  try {
    console.log('🔄 Starting data migration from local MongoDB to Atlas...\n');
    
    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    localConnection = await mongoose.createConnection(localUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to local MongoDB\n');
    
    // Connect to Atlas MongoDB
    console.log('📡 Connecting to MongoDB Atlas...');
    atlasConnection = await mongoose.createConnection(atlasUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Get collections from local database
    const localDb = localConnection.db;
    const atlasDb = atlasConnection.db;
    
    // List all collections
    const collections = await localDb.listCollections().toArray();
    console.log('📊 Found collections in local database:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('');
    
    // Migrate each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`🔄 Migrating collection: ${collectionName}`);
      
      // Get all documents from local collection
      const documents = await localDb.collection(collectionName).find({}).toArray();
      console.log(`  📄 Found ${documents.length} documents`);
      
      if (documents.length > 0) {
        // Insert documents into Atlas collection
        const result = await atlasDb.collection(collectionName).insertMany(documents);
        console.log(`  ✅ Successfully migrated ${result.insertedCount} documents`);
        
        // Show sample data
        console.log(`  📋 Sample data:`);
        documents.slice(0, 3).forEach((doc, index) => {
          if (doc.name) {
            console.log(`    ${index + 1}. ${doc.name}`);
          } else if (doc.email) {
            console.log(`    ${index + 1}. ${doc.email}`);
          } else {
            console.log(`    ${index + 1}. ${JSON.stringify(doc).substring(0, 50)}...`);
          }
        });
      } else {
        console.log(`  ℹ️  No documents to migrate`);
      }
      console.log('');
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    
    // Show final counts in Atlas
    for (const collection of collections) {
      const count = await atlasDb.collection(collection.name).countDocuments();
      console.log(`  📈 ${collection.name}: ${count} documents`);
    }
    
    console.log('\n✅ All your data has been moved to MongoDB Atlas!');
    console.log('🔧 Next steps:');
    console.log('   1. Update your .env file with the Atlas connection string');
    console.log('   2. Restart your backend server');
    console.log('   3. Your app will now use MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure local MongoDB is running');
    console.log('   2. Check your Atlas connection string');
    console.log('   3. Verify Atlas network access allows your IP');
  } finally {
    // Close connections
    if (localConnection) {
      await localConnection.close();
      console.log('🔌 Closed local MongoDB connection');
    }
    if (atlasConnection) {
      await atlasConnection.close();
      console.log('🔌 Closed Atlas MongoDB connection');
    }
  }
}

// Run migration
migrateData();

const mongoose = require('mongoose');

async function migrateData() {
  try {
    console.log('🔄 Starting simple migration...\n');
    
    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    const localConnection = await mongoose.createConnection('mongodb://localhost:27017/whatsapp-crm');
    console.log('✅ Connected to local MongoDB');
    
    // Connect to Atlas MongoDB
    console.log('📡 Connecting to MongoDB Atlas...');
    const atlasConnection = await mongoose.createConnection('mongodb+srv://Mihir:Mihir123@noven.p4qjkrd.mongodb.net/whatsapp-crm?retryWrites=true&w=majority');
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Get collections
    const localDb = localConnection.db;
    const atlasDb = atlasConnection.db;
    
    // List collections
    const collections = await localDb.listCollections().toArray();
    console.log('📊 Collections found:', collections.map(c => c.name).join(', '));
    
    // Migrate each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n🔄 Migrating ${collectionName}...`);
      
      // Get all documents
      const documents = await localDb.collection(collectionName).find({}).toArray();
      console.log(`  Found ${documents.length} documents`);
      
      if (documents.length > 0) {
        // Clear existing data in Atlas (optional)
        await atlasDb.collection(collectionName).deleteMany({});
        
        // Insert documents
        const result = await atlasDb.collection(collectionName).insertMany(documents);
        console.log(`  ✅ Migrated ${result.insertedCount} documents`);
        
        // Show sample
        documents.slice(0, 2).forEach((doc, i) => {
          if (doc.name) console.log(`    ${i+1}. ${doc.name}`);
          else if (doc.email) console.log(`    ${i+1}. ${doc.email}`);
        });
      }
    }
    
    console.log('\n🎉 Migration completed!');
    
    // Verify migration
    console.log('\n📋 Verification:');
    for (const collection of collections) {
      const count = await atlasDb.collection(collection.name).countDocuments();
      console.log(`  ${collection.name}: ${count} documents`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
}

migrateData();

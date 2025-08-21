const mongoose = require('mongoose');
const fs = require('fs');

async function exportData() {
  try {
    console.log('📤 Exporting data from local MongoDB...\n');
    
    // Connect to local MongoDB
    const connection = await mongoose.createConnection('mongodb://localhost:27017/whatsapp-crm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to local MongoDB');
    
    const db = connection.db;
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections found:', collections.map(c => c.name).join(', '));
    
    // Export each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n📤 Exporting ${collectionName}...`);
      
      try {
        // Get all documents
        const documents = await db.collection(collectionName).find({}).toArray();
        console.log(`  Found ${documents.length} documents`);
        
        if (documents.length > 0) {
          // Save to JSON file
          const filename = `${collectionName}.json`;
          fs.writeFileSync(filename, JSON.stringify(documents, null, 2));
          console.log(`  ✅ Exported to ${filename}`);
          
          // Show sample
          documents.slice(0, 2).forEach((doc, i) => {
            if (doc.name) console.log(`    ${i+1}. ${doc.name}`);
            else if (doc.email) console.log(`    ${i+1}. ${doc.email}`);
          });
        }
      } catch (error) {
        console.log(`  ❌ Error exporting ${collectionName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Export completed!');
    console.log('📁 Check the JSON files in the current directory');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
}

exportData();

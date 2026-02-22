const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/test');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', async () => {
  console.log('Connected to MongoDB successfully');
  
  try {
    // Access the orders collection
    const collections = await db.db.collections();
    const orderCollection = collections.find(col => col.collectionName === 'orders');
    
    if (!orderCollection) {
      console.log('Orders collection not found');
      return;
    }
    
    // List all indexes in the orders collection
    console.log('\nCurrent indexes in orders collection:');
    const indexes = await orderCollection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Index Name: ${index.name}`);
      console.log(`   Keys:`, index.key);
      console.log('');
    });
    
    // Look for the problematic index and drop it
    const problematicIndexNames = indexes
      .filter(index => index.key.orderId !== undefined)
      .map(index => index.name);
    
    if (problematicIndexNames.length > 0) {
      console.log('Found problematic indexes:', problematicIndexNames);
      
      for (const indexName of problematicIndexNames) {
        console.log(`Dropping index: ${indexName}`);
        await orderCollection.dropIndex(indexName);
        console.log(`✓ Index ${indexName} dropped successfully`);
      }
      
      console.log('\nProblematic indexes have been removed!');
    } else {
      console.log('No problematic indexes found.');
    }
    
    // Verify the cleanup
    console.log('\nIndexes after cleanup:');
    const remainingIndexes = await orderCollection.indexes();
    remainingIndexes.forEach((index, i) => {
      console.log(`${i + 1}. Index Name: ${index.name}`);
      console.log(`   Keys:`, index.key);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error during index cleanup:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
});
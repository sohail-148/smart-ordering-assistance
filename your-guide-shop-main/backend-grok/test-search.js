// Simple test script to verify search functionality
const { ProductModel } = require('./dist/models/Product');
const { RAGService } = require('./dist/services/ragService');
const { initializeDatabase } = require('./dist/config/database');

async function testSearch() {
  console.log('Initializing database...');
  initializeDatabase();
  
  console.log('\n=== Testing Product Search ===');
  
  // Test cases that were failing
  const testCases = [
    'headphone',
    'headphones', 
    'show me the headphone',
    'Headphone',
    'aurasound',
    'best headphones under 300'
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing: "${testCase}" ---`);
    
    try {
      const context = await RAGService.getProductContext(testCase);
      console.log(`Found ${context.products.length} products`);
      
      if (context.products.length > 0) {
        context.products.forEach(p => {
          console.log(`  - ${p.name} ($${p.price})`);
        });
      } else {
        console.log('  No products found');
        console.log('  Context:', context.contextString.substring(0, 100) + '...');
      }
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }
  
  console.log('\n=== Direct Product Model Search ===');
  
  // Test ProductModel directly
  const directTests = ['headphone', 'headphones', 'aurasound'];
  
  for (const test of directTests) {
    console.log(`\n--- Direct search: "${test}" ---`);
    const results = ProductModel.searchForRAG(test, 5);
    console.log(`Found ${results.length} products`);
    results.forEach(p => {
      console.log(`  - ${p.name} ($${p.price})`);
    });
  }
}

testSearch().catch(console.error);
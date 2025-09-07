// Quick test script to verify dual ID support
const fetch = require('node-fetch');

async function testDualIdSupport() {
  try {
    console.log('Testing dual ID support...\n');
    
    // Test 1: Get all products to see their IDs
    console.log('1. Getting all products...');
    const allProductsResponse = await fetch('http://localhost:3000/api/products');
    const products = await allProductsResponse.json();
    
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('First product structure:', {
        id: firstProduct.id,
        internalProductId: firstProduct.internalProductId,
        partNumber: firstProduct.partNumber,
        brand: firstProduct.brand
      });
      
      // Test 2: Try to access by the ID shown in the structure
      console.log('\n2. Testing access by product.id...');
      const byIdResponse = await fetch(`http://localhost:3000/api/products/${firstProduct.id}`);
      console.log('Status:', byIdResponse.status);
      
      if (byIdResponse.ok) {
        const productById = await byIdResponse.json();
        console.log('Successfully retrieved product by ID:', productById.partNumber);
      } else {
        const error = await byIdResponse.json();
        console.log('Error:', error);
      }
      
      // Test 3: Try internal ID endpoint if different
      if (firstProduct.internalProductId && firstProduct.internalProductId !== firstProduct.id) {
        console.log('\n3. Testing internal ID endpoint...');
        const byInternalIdResponse = await fetch(`http://localhost:3000/api/products/internal/${firstProduct.internalProductId}`);
        console.log('Status:', byInternalIdResponse.status);
        
        if (byInternalIdResponse.ok) {
          const productByInternalId = await byInternalIdResponse.json();
          console.log('Successfully retrieved product by internal ID:', productByInternalId.partNumber);
        } else {
          const error = await byInternalIdResponse.json();
          console.log('Error:', error);
        }
      }
      
      // Test 4: Try brand/part number endpoint
      console.log('\n4. Testing brand/part number endpoint...');
      const brand = firstProduct.brand.toUpperCase().substring(0, 4).replace(/[^A-Z0-9]/g, '');
      const partNumber = firstProduct.partNumber;
      const byBrandPartResponse = await fetch(`http://localhost:3000/api/products/brand/${brand}/part/${partNumber}`);
      console.log('Status:', byBrandPartResponse.status);
      
      if (byBrandPartResponse.ok) {
        const productByBrandPart = await byBrandPartResponse.json();
        console.log('Successfully retrieved product by brand/part:', productByBrandPart.partNumber);
      } else {
        const error = await byBrandPartResponse.json();
        console.log('Error:', error);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDualIdSupport();
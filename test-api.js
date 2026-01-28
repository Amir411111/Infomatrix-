const http = require('http');

// Test GET
console.log('📝 Testing GET /api/wardrobe...');
const getOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/wardrobe',
  method: 'GET'
};

const getReq = http.request(getOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✓ GET Status:', res.statusCode);
    console.log('✓ Items count:', JSON.parse(data || '[]').length);
    
    // Test POST
    testPost();
  });
});

getReq.on('error', (err) => {
  console.error('✗ GET Error (' + err.code + '):', err.message);
});

getReq.end();

function testPost() {
  console.log('\n📝 Testing POST /api/wardrobe...');
  const itemData = JSON.stringify({
    name: 'Test Item',
    category: 'top',
    color: 'red',
    material: 'cotton',
    userId: 'default'
  });

  const postOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/wardrobe',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(itemData)
    }
  };

  const postReq = http.request(postOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('✓ POST Status:', res.statusCode);
      const item = JSON.parse(data);
      console.log('✓ Created item:', item.name, 'ID:', item._id);
      
      // Test DELETE
      testDelete(item._id);
    });
  });

  postReq.on('error', (err) => {
    console.error('✗ POST Error (' + err.code + '):', err.message);
  });

  postReq.write(itemData);
  postReq.end();
}

function testDelete(itemId) {
  console.log('\n📝 Testing DELETE /api/wardrobe/:id...');
  const deleteOptions = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/wardrobe/${itemId}`,
    method: 'DELETE'
  };

  const deleteReq = http.request(deleteOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('✓ DELETE Status:', res.statusCode);
      console.log('\n✅ All tests completed!');
    });
  });

  deleteReq.on('error', (err) => {
    console.error('✗ DELETE Error (' + err.code + '):', err.message);
  });

  deleteReq.end();
}

#!/usr/bin/env tsx
/**
 * Test script to manually trigger winner processing flow
 * Usage: npx tsx test-winner-flow.ts
 */

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000';

async function triggerEndAuctions() {
  console.log('\n🔄 Triggering auction ending...');
  
  const response = await fetch(`${BASE_URL}/api/auctions/end-auctions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CRON_SECRET}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  console.log('✅ End auctions response:', JSON.stringify(data, null, 2));
  return data;
}

async function triggerProcessWinners() {
  console.log('\n💰 Triggering winner payment processing...');
  
  const response = await fetch(`${BASE_URL}/api/auctions/process-winners`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CRON_SECRET}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  console.log('✅ Process winners response:', JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  console.log('🚀 Starting winner flow test...\n');
  console.log('Base URL:', BASE_URL);
  console.log('Using CRON_SECRET:', CRON_SECRET);
  
  try {
    // Step 1: End auctions and determine winners
    const endResult = await triggerEndAuctions();
    
    // Wait a moment for database to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Process winners and charge payments
    const processResult = await triggerProcessWinners();
    
    console.log('\n✅ Test complete!');
    console.log('\nSummary:');
    console.log(`- Auctions published: ${endResult.published || 0}`);
    console.log(`- Auctions ended: ${endResult.ended_auctions || 0}`);
    console.log(`- Items processed: ${endResult.processed_items || 0}`);
    console.log(`- Winners processed: ${processResult.processed || 0}`);
    
    console.log('\n💡 Next steps:');
    console.log('1. Check the database for notifications');
    console.log('2. Login as a winner to see congratulations notification');
    console.log('3. Check mybids page "Won" tab to see won items\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

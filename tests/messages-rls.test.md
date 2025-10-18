# Messages RLS Test Cases

This document outlines test cases to verify that Row Level Security (RLS) policies on the `messages` table correctly prevent cross-user access.

## Test Setup

The messages table has the following RLS policies:
1. **SELECT**: Users can only select messages where they are sender or receiver
2. **INSERT**: Users can only insert messages where they are the sender
3. **UPDATE**: Users can only update messages where they are the receiver (to mark as read)

## Manual Test Cases

### Test 1: User can read their own messages

**Setup:**
- User A (ID: user-a-id)
- User B (ID: user-b-id)
- Message from A to B

**Test:**
```sql
-- As User A, should see the message
SET request.jwt.claims = '{"sub": "user-a-id"}';
SELECT * FROM messages WHERE sender_id = 'user-a-id' AND receiver_id = 'user-b-id';
-- Expected: Returns the message
```

### Test 2: User cannot read messages they are not part of

**Setup:**
- User A (ID: user-a-id)
- User B (ID: user-b-id)
- User C (ID: user-c-id)
- Message from A to B

**Test:**
```sql
-- As User C, should NOT see the message between A and B
SET request.jwt.claims = '{"sub": "user-c-id"}';
SELECT * FROM messages WHERE sender_id = 'user-a-id' AND receiver_id = 'user-b-id';
-- Expected: Returns empty result
```

### Test 3: User can insert messages as themselves

**Setup:**
- User A (ID: user-a-id)
- User B (ID: user-b-id)

**Test:**
```sql
-- As User A, should be able to send message to B
SET request.jwt.claims = '{"sub": "user-a-id"}';
INSERT INTO messages (sender_id, receiver_id, content)
VALUES ('user-a-id', 'user-b-id', 'Hello from A');
-- Expected: Success
```

### Test 4: User cannot insert messages as another user

**Setup:**
- User A (ID: user-a-id)
- User B (ID: user-b-id)
- User C (ID: user-c-id)

**Test:**
```sql
-- As User C, should NOT be able to send message from A to B
SET request.jwt.claims = '{"sub": "user-c-id"}';
INSERT INTO messages (sender_id, receiver_id, content)
VALUES ('user-a-id', 'user-b-id', 'Fake message from A');
-- Expected: Permission denied / RLS violation
```

### Test 5: User can mark received messages as read

**Setup:**
- User A (ID: user-a-id)
- User B (ID: user-b-id)
- Message from A to B (unread)

**Test:**
```sql
-- As User B (receiver), should be able to mark message as read
SET request.jwt.claims = '{"sub": "user-b-id"}';
UPDATE messages SET read_at = NOW()
WHERE sender_id = 'user-a-id' AND receiver_id = 'user-b-id' AND read_at IS NULL;
-- Expected: Success
```

### Test 6: User cannot mark sent messages as read

**Setup:**
- User A (ID: user-a-id)
- User B (ID: user-b-id)
- Message from A to B (unread)

**Test:**
```sql
-- As User A (sender), should NOT be able to mark message as read
SET request.jwt.claims = '{"sub": "user-a-id"}';
UPDATE messages SET read_at = NOW()
WHERE sender_id = 'user-a-id' AND receiver_id = 'user-b-id' AND read_at IS NULL;
-- Expected: Permission denied / RLS violation
```

### Test 7: User cannot mark messages they are not part of as read

**Setup:**
- User A (ID: user-a-id)
- User B (ID: user-b-id)
- User C (ID: user-c-id)
- Message from A to B (unread)

**Test:**
```sql
-- As User C, should NOT be able to mark message between A and B as read
SET request.jwt.claims = '{"sub": "user-c-id"}';
UPDATE messages SET read_at = NOW()
WHERE sender_id = 'user-a-id' AND receiver_id = 'user-b-id' AND read_at IS NULL;
-- Expected: Permission denied / RLS violation
```

## API-Level Tests

### Test 8: API enforces RLS via Supabase client

**Test Send Message API:**
```typescript
// User A tries to send message as User B (should fail)
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <user-a-token>'
  },
  body: JSON.stringify({
    sender_id: 'user-b-id', // Different from authenticated user
    receiver_id: 'user-c-id',
    content: 'Fake message'
  })
});
// Expected: 403 or RLS violation error
```

### Test 9: API enforces RLS on message fetching

**Test Fetch Messages API:**
```typescript
// User A tries to fetch messages between User B and User C
const response = await fetch('/api/messages/user-c-id', {
  headers: {
    'Authorization': 'Bearer <user-a-token>' // User A's token
  }
});
// Expected: Returns empty array (RLS blocks messages not involving User A)
```

### Test 10: Mark as read RPC enforces authorization

**Test mark_messages_read RPC:**
```typescript
// User A tries to mark User B's messages as read
const response = await supabase.rpc('mark_messages_read', {
  p_sender_id: 'user-c-id',
  p_receiver_id: 'user-b-id' // User B, not User A
});
// Expected: Error - "Unauthorized: You can only mark your own messages as read"
```

## Running Tests

To run these tests:

1. Create test users with known IDs
2. Execute SQL tests directly against the database
3. Run API tests using a testing framework (Jest, Vitest, etc.)
4. Verify that all unauthorized operations are blocked by RLS

## Success Criteria

All tests should pass with:
- Authorized operations succeeding
- Unauthorized operations failing with permission errors
- No data leakage across users
- Proper error messages returned to clients

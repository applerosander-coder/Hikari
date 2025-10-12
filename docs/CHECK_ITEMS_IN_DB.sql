-- Check if auction items exist
SELECT 
  ai.id,
  ai.title,
  ai.starting_price / 100.0 as price_dollars,
  ai.auction_id,
  a.name as auction_name,
  a.status as auction_status
FROM public.auction_items ai
LEFT JOIN public.auctions a ON ai.auction_id = a.id
ORDER BY a.name, ai.position
LIMIT 25;

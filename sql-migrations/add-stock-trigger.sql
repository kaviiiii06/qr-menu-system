-- Sipariş verildiğinde stok otomatik düşüş trigger'ı
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- Trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION decrease_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Ürünün stok takibi aktif mi kontrol et
  IF EXISTS (
    SELECT 1 FROM products 
    WHERE id = NEW.product_id 
    AND stock_enabled = true
  ) THEN
    -- Stok düş
    UPDATE products
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE id = NEW.product_id;
    
    -- Stok hareketi kaydet
    INSERT INTO stock_movements (
      product_id,
      restaurant_id,
      movement_type,
      quantity,
      previous_quantity,
      new_quantity,
      notes
    )
    SELECT 
      NEW.product_id,
      (SELECT restaurant_id FROM orders WHERE id = NEW.order_id),
      'OUT',
      NEW.quantity,
      stock_quantity + NEW.quantity,
      stock_quantity,
      'Otomatik düşüş - Sipariş #' || NEW.order_id
    FROM products
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS trigger_decrease_stock ON order_items;
CREATE TRIGGER trigger_decrease_stock
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION decrease_stock_on_order();

-- Test
-- Bir sipariş oluştur ve stok düşüşünü kontrol et
SELECT 
  p.name,
  p.stock_quantity,
  p.stock_enabled
FROM products p
WHERE p.stock_enabled = true
LIMIT 5;

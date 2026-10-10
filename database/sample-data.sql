-- FreightRail Insight: additional sample data
-- Run ONCE on top of the existing data. Everything is in one transaction,
-- so if anything fails, nothing is inserted.
BEGIN;

SELECT setseed(0.42);  -- same "random" data every time you rebuild

-- Make sure the SERIAL sequences are ahead of existing ids
SELECT setval(pg_get_serial_sequence('customers','customer_id'),      (SELECT MAX(customer_id)  FROM customers));
SELECT setval(pg_get_serial_sequence('stations','station_id'),        (SELECT MAX(station_id)   FROM stations));
SELECT setval(pg_get_serial_sequence('freight_trains','train_id'),    (SELECT MAX(train_id)     FROM freight_trains));
SELECT setval(pg_get_serial_sequence('shipments','shipment_id'),      (SELECT MAX(shipment_id)  FROM shipments));
SELECT setval(pg_get_serial_sequence('operation_logs','operation_id'),(SELECT MAX(operation_id) FROM operation_logs));
SELECT setval(pg_get_serial_sequence('incidents','incident_id'),      (SELECT MAX(incident_id)  FROM incidents));

-- ---------- Customers (7 new) ----------
INSERT INTO customers (company_name, contact_person, phone, city) VALUES
('JSW Steel',        'Meera Nair',     '9810011001', 'Bellary'),
('SAIL',             'Amit Verma',     '9810011002', 'Bhilai'),
('Adani Ports',      'Karan Mehta',    '9810011003', 'Mundra'),
('Hindalco',         'Sunita Rao',     '9810011004', 'Renukoot'),
('UltraTech Cement', 'Vikram Singh',   '9810011005', 'Mumbai'),
('IFFCO',            'Neha Gupta',     '9810011006', 'Allahabad'),
('Indian Oil',       'Rahul Bansal',   '9810011007', 'Mathura');

-- ---------- Stations (6 new) ----------
INSERT INTO stations (station_code, station_name, city, state) VALUES
('HWH', 'Howrah Junction',          'Howrah',    'West Bengal'),
('DDU', 'Pt. DD Upadhyaya Jn',      'Chandauli', 'Uttar Pradesh'),
('NGP', 'Nagpur Junction',          'Nagpur',    'Maharashtra'),
('BPL', 'Bhopal Junction',          'Bhopal',    'Madhya Pradesh'),
('BSP', 'Bilaspur Junction',        'Bilaspur',  'Chhattisgarh'),
('ADI', 'Ahmedabad Junction',       'Ahmedabad', 'Gujarat')
ON CONFLICT (station_code) DO NOTHING;

-- ---------- Trains (5 new; skips any number you already added while testing) ----------
INSERT INTO freight_trains (train_number, train_name, capacity_tons, status) VALUES
('FR1004', 'Steel Corridor Express', 3800, 'ACTIVE'),
('FR1005', 'Western Cargo Link',     4500, 'ACTIVE'),
('FR1006', 'Central India Hauler',   4000, 'ACTIVE'),
('FR1007', 'Gangetic Freight',       3200, 'MAINTENANCE'),
('FR1008', 'Deccan Bulk Carrier',    5200, 'ACTIVE')
ON CONFLICT (train_number) DO NOTHING;

-- ---------- Shipments (37 new, ids 4+; ~7 weeks of history) ----------
WITH ref AS MATERIALIZED (
  SELECT (SELECT array_agg(customer_id ORDER BY customer_id) FROM customers)      AS ca,
         (SELECT array_agg(station_id  ORDER BY station_id)  FROM stations)       AS sa,
         (SELECT array_agg(train_id    ORDER BY train_id)    FROM freight_trains) AS ta
),
base AS MATERIALIZED (
  SELECT g,
         DATE '2026-08-20' + (g * 1.3)::int                                   AS sdate,
         ref.ca[1 + floor(random() * cardinality(ref.ca))::int]               AS customer_id,
         ref.ta[1 + floor(random() * cardinality(ref.ta))::int]               AS train_id,
         1 + floor(random() * 10)::int                                        AS cargo_idx,
         (300 + floor(random() * 2200))::numeric                              AS weight,
         1 + floor(random() * cardinality(ref.sa))::int                       AS oi,
         floor(random() * (cardinality(ref.sa) - 1))::int                     AS off,
         (2 + floor(random() * 4))::int                                       AS days,
         floor(random() * 24)::int                                            AS hr,
         random() AS r,
         random() AS r2,
         ref.sa
  FROM generate_series(1, 37) g, ref
),
x AS (
  SELECT b.*,
         (b.sdate + b.days)::timestamp + b.hr * interval '1 hour' AS exp,
         CASE
           WHEN b.sdate < DATE '2026-09-25' THEN 'DELIVERED'
           WHEN b.sdate < DATE '2026-10-04' THEN
             CASE WHEN b.r < 0.6 THEN 'DELIVERED' WHEN b.r < 0.8 THEN 'DELAYED' ELSE 'IN_TRANSIT' END
           ELSE
             CASE WHEN b.r < 0.4 THEN 'IN_TRANSIT' WHEN b.r < 0.6 THEN 'DELAYED' ELSE 'PLANNED' END
         END AS status
  FROM base b
)
INSERT INTO shipments (customer_id, train_id, cargo_type, weight_tons, origin_station_id,
                       destination_station_id, shipment_date, expected_delivery, actual_delivery, status)
SELECT customer_id,
       train_id,
       (ARRAY['Steel Coils','Thermal Coal','Raw Iron','Cement','Fertilizer',
              'Grain','Containers','Petroleum','Limestone','Automobiles'])[cargo_idx],
       weight,
       sa[oi],
       sa[1 + ((oi + off) % cardinality(sa))],     -- always a different station than the origin
       sdate,
       exp,
       CASE WHEN status = 'DELIVERED' THEN exp + (r2 * 40 - 8) * interval '1 hour' END,
       status
FROM x
ORDER BY g;

-- ---------- Operation logs (~100+; delay depends on the train) ----------
INSERT INTO operation_logs (train_id, shipment_id, event_type, scheduled_time, actual_time, delay_minutes, recorded_at)
SELECT s.train_id,
       s.shipment_id,
       e.event_type,
       e.sched,
       e.sched + d.delay * interval '1 minute',
       d.delay,
       e.sched + d.delay * interval '1 minute' + interval '5 minutes'
FROM shipments s
CROSS JOIN LATERAL (VALUES
    ('DEPARTURE',  s.shipment_date::timestamp + interval '6 hours'),
    ('CHECKPOINT', s.shipment_date::timestamp + (s.expected_delivery - s.shipment_date::timestamp) / 3),
    ('CHECKPOINT', s.shipment_date::timestamp + (s.expected_delivery - s.shipment_date::timestamp) * 2 / 3),
    ('ARRIVAL',    s.expected_delivery)
) AS e(event_type, sched)
CROSS JOIN LATERAL (
    SELECT round(power(random(), 2) * 180 * (0.5 + (s.train_id % 3) * 0.6))::int AS delay
) AS d
WHERE s.shipment_id > 3
  AND s.train_id IS NOT NULL
  AND s.status <> 'PLANNED'
  AND (e.event_type <> 'ARRIVAL' OR s.status = 'DELIVERED');

-- ---------- Incidents (14 new) ----------
INSERT INTO incidents (train_id, incident_type, severity, description, incident_time, status)
SELECT t.train_id, v.itype, v.sev, v.descr, v.itime::timestamp, v.status
FROM (VALUES
 ('FR1001','SIGNAL_FAILURE',   'MEDIUM',   'Signal flickering near Ghaziabad yard',          '2026-09-05 09:40', 'RESOLVED'),
 ('FR1001','TRACK_OBSTRUCTION','LOW',      'Cattle on track, brief halt',                    '2026-09-18 21:15', 'RESOLVED'),
 ('FR1002','ENGINE_FAULT',     'HIGH',     'Locomotive traction motor overheating',          '2026-09-22 03:30', 'RESOLVED'),
 ('FR1002','BRAKE_FAILURE',    'CRITICAL', 'Brake pipe pressure loss on descent',            '2026-10-03 16:05', 'OPEN'),
 ('FR1003','OVERHEAD_WIRE',    'HIGH',     'Overhead wire snapped near Dhanbad section',     '2026-09-10 12:20', 'RESOLVED'),
 ('FR1003','ENGINE_FAULT',     'MEDIUM',   'Auxiliary compressor failure',                   '2026-09-28 07:50', 'RESOLVED'),
 ('FR1004','WEATHER',          'LOW',      'Dense fog, speed restriction in force',          '2026-09-30 05:10', 'RESOLVED'),
 ('FR1004','CARGO_DAMAGE',     'MEDIUM',   'Wagon door found open, cargo shift suspected',   '2026-10-05 18:45', 'OPEN'),
 ('FR1005','SIGNAL_FAILURE',   'HIGH',     'Interlocking fault at Nagpur approach',          '2026-09-14 14:00', 'RESOLVED'),
 ('FR1005','TRACK_OBSTRUCTION','MEDIUM',   'Landslide debris on line after heavy rain',      '2026-09-25 22:35', 'RESOLVED'),
 ('FR1006','BRAKE_FAILURE',    'HIGH',     'Hand brake not released on wagon 14',            '2026-10-01 10:25', 'OPEN'),
 ('FR1006','WEATHER',          'MEDIUM',   'Flooding near Bilaspur, line closed 3 hours',    '2026-09-08 19:55', 'RESOLVED'),
 ('FR1008','OVERHEAD_WIRE',    'LOW',      'Pantograph sparking, inspected and cleared',     '2026-10-06 08:30', 'RESOLVED'),
 ('FR1008','ENGINE_FAULT',     'CRITICAL', 'Engine fire alarm triggered, train halted',      '2026-10-07 13:10', 'OPEN')
) AS v(train_number, itype, sev, descr, itime, status)
JOIN freight_trains t ON t.train_number = v.train_number;

COMMIT;

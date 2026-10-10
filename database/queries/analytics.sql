-- FreightRail Insight: analytics queries
-- Run all:  psql -f database/queries/analytics.sql
-- Each query is numbered so you can copy one at a time.

-- Q1. Delay summary per train (reliability ranking)
SELECT t.train_number,
       t.train_name,
       count(*)                            AS events,
       round(avg(o.delay_minutes), 1)      AS avg_delay_min,
       max(o.delay_minutes)                AS max_delay_min,
       count(*) FILTER (WHERE o.delay_minutes > 60) AS events_over_60min,
       rank() OVER (ORDER BY avg(o.delay_minutes) DESC) AS delay_rank
FROM operation_logs o
JOIN freight_trains t ON t.train_id = o.train_id
GROUP BY t.train_id, t.train_number, t.train_name
ORDER BY avg_delay_min DESC;

-- Q2. Delay by route (origin -> destination)
SELECT so.station_code || ' -> ' || sd.station_code AS route,
       count(DISTINCT s.shipment_id)       AS shipments,
       round(avg(o.delay_minutes), 1)      AS avg_delay_min,
       max(o.delay_minutes)                AS max_delay_min
FROM operation_logs o
JOIN shipments s  ON s.shipment_id = o.shipment_id
JOIN stations  so ON so.station_id = s.origin_station_id
JOIN stations  sd ON sd.station_id = s.destination_station_id
GROUP BY so.station_code, sd.station_code
ORDER BY avg_delay_min DESC;

-- Q3. Average delay by event type
SELECT event_type,
       count(*)                        AS events,
       round(avg(delay_minutes), 1)    AS avg_delay_min
FROM operation_logs
GROUP BY event_type
ORDER BY avg_delay_min DESC;

-- Q4a. Overall on-time delivery percentage
SELECT count(*)                                                    AS delivered,
       count(*) FILTER (WHERE actual_delivery <= expected_delivery) AS on_time,
       round(100.0 * count(*) FILTER (WHERE actual_delivery <= expected_delivery)
             / NULLIF(count(*), 0), 1)                             AS on_time_pct
FROM shipments
WHERE status = 'DELIVERED' AND actual_delivery IS NOT NULL;

-- Q4b. On-time delivery percentage per train
SELECT t.train_number,
       count(*)                                                    AS delivered,
       round(100.0 * count(*) FILTER (WHERE s.actual_delivery <= s.expected_delivery)
             / count(*), 1)                                        AS on_time_pct
FROM shipments s
JOIN freight_trains t ON t.train_id = s.train_id
WHERE s.status = 'DELIVERED' AND s.actual_delivery IS NOT NULL
GROUP BY t.train_number
ORDER BY on_time_pct;

-- Q5. Incidents per train, split by severity
SELECT t.train_number,
       count(*)                                          AS total,
       count(*) FILTER (WHERE i.severity = 'LOW')        AS low,
       count(*) FILTER (WHERE i.severity = 'MEDIUM')     AS medium,
       count(*) FILTER (WHERE i.severity = 'HIGH')       AS high,
       count(*) FILTER (WHERE i.severity = 'CRITICAL')   AS critical,
       count(*) FILTER (WHERE i.status = 'OPEN')         AS still_open
FROM incidents i
JOIN freight_trains t ON t.train_id = i.train_id
GROUP BY t.train_number
ORDER BY total DESC;

-- Q6. Most common incident types
SELECT incident_type,
       count(*)                                   AS incidents,
       count(*) FILTER (WHERE status = 'OPEN')    AS open
FROM incidents
GROUP BY incident_type
ORDER BY incidents DESC;

-- Q7. Customer volume: shipments, tonnage, and share of delayed shipments
SELECT c.company_name,
       count(*)                                                AS shipments,
       sum(s.weight_tons)                                      AS total_tons,
       count(*) FILTER (WHERE s.status = 'DELAYED')            AS delayed,
       round(100.0 * count(*) FILTER (WHERE s.status = 'DELAYED') / count(*), 1) AS delayed_pct
FROM shipments s
JOIN customers c ON c.customer_id = s.customer_id
GROUP BY c.company_name
ORDER BY total_tons DESC;

-- Q8. Monthly trend: shipments and tonnage
SELECT to_char(date_trunc('month', shipment_date), 'YYYY-MM') AS month,
       count(*)           AS shipments,
       sum(weight_tons)   AS tons
FROM shipments
GROUP BY date_trunc('month', shipment_date)
ORDER BY date_trunc('month', shipment_date);

-- Q9. Weekly trend: average delay, with change versus previous week
WITH weekly AS (
  SELECT date_trunc('week', scheduled_time)::date AS week,
         round(avg(delay_minutes), 1)             AS avg_delay_min,
         count(*)                                 AS events
  FROM operation_logs
  GROUP BY 1
)
SELECT week,
       events,
       avg_delay_min,
       round(avg_delay_min - lag(avg_delay_min) OVER (ORDER BY week), 1) AS change_vs_prev_week
FROM weekly
ORDER BY week;

-- Q10. Train utilisation: average load as % of capacity
SELECT t.train_number,
       t.capacity_tons,
       count(*)                                              AS shipments,
       round(avg(s.weight_tons), 0)                          AS avg_load_tons,
       round(100.0 * avg(s.weight_tons) / t.capacity_tons, 1) AS avg_load_pct
FROM shipments s
JOIN freight_trains t ON t.train_id = s.train_id
GROUP BY t.train_number, t.capacity_tons
ORDER BY avg_load_pct DESC;

-- Q11. Anomalies: delays more than 2 standard deviations above that train's own average
--      (this is the statistical starting point for the ML phase)
WITH stats AS (
  SELECT train_id,
         avg(delay_minutes)         AS mean_delay,
         stddev_samp(delay_minutes) AS sd_delay
  FROM operation_logs
  GROUP BY train_id
)
SELECT o.operation_id,
       t.train_number,
       o.event_type,
       o.delay_minutes,
       round(st.mean_delay, 1)                                          AS train_avg,
       round((o.delay_minutes - st.mean_delay) / NULLIF(st.sd_delay, 0), 2) AS z_score
FROM operation_logs o
JOIN stats st ON st.train_id = o.train_id
JOIN freight_trains t ON t.train_id = o.train_id
WHERE (o.delay_minutes - st.mean_delay) / NULLIF(st.sd_delay, 0) > 2
ORDER BY z_score DESC;

-- Q12. Open incidents with how long they have been open
SELECT i.incident_id,
       t.train_number,
       i.incident_type,
       i.severity,
       i.incident_time,
       (now()::date - i.incident_time::date) AS days_open
FROM incidents i
JOIN freight_trains t ON t.train_id = i.train_id
WHERE i.status = 'OPEN'
ORDER BY CASE i.severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
         i.incident_time;

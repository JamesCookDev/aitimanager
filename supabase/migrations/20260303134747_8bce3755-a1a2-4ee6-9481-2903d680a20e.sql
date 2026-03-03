
UPDATE devices 
SET ui_config = jsonb_set(
  ui_config,
  '{free_canvas,elements}',
  (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(ui_config->'free_canvas'->'elements') AS elem
    WHERE elem->>'type' != 'avatar'
  )
)
WHERE id = 'a88cdd7c-d26a-43f2-9df9-b7a474f1f089'

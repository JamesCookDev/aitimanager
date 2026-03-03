
UPDATE devices 
SET ui_config = jsonb_set(
  ui_config,
  '{free_canvas,elements,3,props,htmlContent}',
  to_jsonb(
    replace(
      ui_config->'free_canvas'->'elements'->3->'props'->>'htmlContent',
      '<iframe id="avatarViewer" src="about:blank"',
      '<iframe id="avatarViewer" data-avatar-embed="true"'
    )
  )
)
WHERE id = 'a88cdd7c-d26a-43f2-9df9-b7a474f1f089'

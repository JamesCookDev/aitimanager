
UPDATE devices 
SET ui_config = jsonb_set(
  ui_config,
  '{free_canvas,elements,3,props,htmlContent}',
  to_jsonb(
    regexp_replace(
      ui_config->'free_canvas'->'elements'->3->'props'->>'htmlContent',
      '<model-viewer\s[^>]*>[\s\S]*?</model-viewer>',
      '<iframe id="avatarViewer" src="about:blank" style="width:100%;height:100%;border:none;border-radius:22px;background:transparent;" allowtransparency="true"></iframe>',
      'g'
    )
  )
)
WHERE id = 'a88cdd7c-d26a-43f2-9df9-b7a474f1f089'

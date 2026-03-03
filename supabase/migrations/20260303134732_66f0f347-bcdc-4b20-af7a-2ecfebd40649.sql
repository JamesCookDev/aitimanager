
UPDATE devices 
SET ui_config = jsonb_set(
  ui_config,
  '{free_canvas,elements,3,props,htmlContent}',
  to_jsonb(
    replace(
      ui_config->'free_canvas'->'elements'->3->'props'->>'htmlContent',
      '<iframe id="avatarViewer" src="/?mode=avatar-only&amp;frameZoom=65&amp;frameY=5&amp;bgColor=transparent" style="width:100%;height:100%;border:none;border-radius:22px;background:transparent;" allowtransparency="true" loading="lazy"></iframe>',
      '<iframe id="avatarViewer" style="width:100%;height:100%;border:none;border-radius:22px;background:transparent;" allowtransparency="true"></iframe><script>document.addEventListener("DOMContentLoaded",function(){var f=document.getElementById("avatarViewer");if(f){var origin=window.parent?window.parent.location.origin:window.location.origin;f.src=origin+"/?mode=avatar-only&frameZoom=65&frameY=5&bgColor=transparent";}});</script>'
    )
  )
)
WHERE id = 'a88cdd7c-d26a-43f2-9df9-b7a474f1f089'

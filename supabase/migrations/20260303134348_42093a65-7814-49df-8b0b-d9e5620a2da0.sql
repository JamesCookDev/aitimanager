
UPDATE devices 
SET ui_config = jsonb_set(
  ui_config,
  '{free_canvas,elements}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN elem_idx = 4 THEN
          jsonb_set(
            elem,
            '{props,htmlContent}',
            to_jsonb(
              replace(
                elem->'props'->>'htmlContent',
                '<model-viewer
          id="avatarViewer"
          src="assets/avatar.glb"
          alt="Avatar 3D"
          autoplay
          camera-controls
          touch-action="pan-y"
          interaction-prompt="none"
          shadow-intensity="1.2"
          exposure="1.1"
          style="width:100%;height:100%;border-radius:22px;">
        </model-viewer>',
                '<iframe
          id="avatarViewer"
          src="/?mode=avatar-only&frameZoom=65&frameY=5&bgColor=transparent"
          style="width:100%;height:100%;border:none;border-radius:22px;background:transparent;"
          allowtransparency="true"
          loading="lazy"
        ></iframe>'
              )
            )
          )
        ELSE elem
      END
    )
    FROM jsonb_array_elements(ui_config->'free_canvas'->'elements') WITH ORDINALITY AS t(elem, elem_idx)
  )
)
WHERE id = 'a88cdd7c-d26a-43f2-9df9-b7a474f1f089'

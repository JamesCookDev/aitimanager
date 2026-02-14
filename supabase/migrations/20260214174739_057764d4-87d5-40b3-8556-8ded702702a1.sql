
ALTER TABLE public.devices
ADD COLUMN ui_config jsonb DEFAULT '{
  "title": "Assistente Virtual",
  "subtitle": "Como posso ajudar?",
  "quick_actions": [
    {
      "emoji": "ℹ️",
      "label": "Informações",
      "prompt": "Quem é você?",
      "color": "from-teal-400 to-cyan-400"
    }
  ]
}'::jsonb;

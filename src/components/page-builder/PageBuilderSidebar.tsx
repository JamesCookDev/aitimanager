import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paintbrush, User, MessageSquare, ImageIcon } from 'lucide-react';
import { BackgroundModule } from './BackgroundModule';
import { AvatarModule } from './AvatarModule';
import { ChatInterfaceModule } from './ChatInterfaceModule';
import { LogoModule } from './LogoModule';
import type { PageBuilderConfig } from '@/types/page-builder';

interface PageBuilderSidebarProps {
  config: PageBuilderConfig;
  onChange: (config: PageBuilderConfig) => void;
}

export function PageBuilderSidebar({ config, onChange }: PageBuilderSidebarProps) {
  return (
    <Tabs defaultValue="background" className="w-full h-full flex flex-col">
      <TabsList className="w-full grid grid-cols-4 shrink-0">
        <TabsTrigger value="background" className="text-xs gap-1">
          <Paintbrush className="w-3.5 h-3.5" /> Cenário
        </TabsTrigger>
        <TabsTrigger value="avatar" className="text-xs gap-1">
          <User className="w-3.5 h-3.5" /> Avatar
        </TabsTrigger>
        <TabsTrigger value="interface" className="text-xs gap-1">
          <MessageSquare className="w-3.5 h-3.5" /> Interface
        </TabsTrigger>
        <TabsTrigger value="logo" className="text-xs gap-1">
          <ImageIcon className="w-3.5 h-3.5" /> Logo
        </TabsTrigger>
      </TabsList>

      <ScrollArea className="flex-1 mt-3">
        <TabsContent value="background" className="mt-0 px-1">
          <BackgroundModule
            canvas={config.canvas}
            onChange={(canvas) => onChange({ ...config, canvas })}
          />
        </TabsContent>
        <TabsContent value="avatar" className="mt-0 px-1">
          <AvatarModule
            avatar={config.components.avatar}
            onChange={(avatar) => onChange({ ...config, components: { ...config.components, avatar } })}
          />
        </TabsContent>
        <TabsContent value="interface" className="mt-0 px-1">
          <ChatInterfaceModule
            chatInterface={config.components.chat_interface}
            onChange={(chat_interface) => onChange({ ...config, components: { ...config.components, chat_interface } })}
          />
        </TabsContent>
        <TabsContent value="logo" className="mt-0 px-1">
          <LogoModule
            logo={config.components.logo}
            onChange={(logo) => onChange({ ...config, components: { ...config.components, logo } })}
          />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}

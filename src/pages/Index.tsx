import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import logoAitinet from '@/assets/logo-aitinet.png';
import { Cpu, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Se usuário logado, redireciona para dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoAitinet} alt="AITINET Logo" className="h-10 w-auto" />
            <h2 className="text-xl font-bold text-foreground">AITI<span className="text-primary">.</span>MANAGER</h2>
          </div>
          <Button onClick={() => navigate('/auth')} variant="default">
            Acessar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Controle Total de Sua Frota
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Gerencie totens de IA em tempo real com inteligência artificial e automação industrial. Monitoramento avançado para operações críticas.
              </p>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Começar Agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Saiba Mais
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="card-industrial p-6">
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Uptime SLA</p>
              </div>
              <div className="card-industrial p-6">
                <p className="text-3xl font-bold text-accent">Real-time</p>
                <p className="text-sm text-muted-foreground">Monitoramento</p>
              </div>
              <div className="card-industrial p-6">
                <p className="text-3xl font-bold text-success">Multi-tenant</p>
                <p className="text-sm text-muted-foreground">Escalável</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-16">Recursos Avançados</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Cpu,
                title: 'Gestão de Dispositivos',
                desc: 'Controle completo de sua frota de totens com status em tempo real'
              },
              {
                icon: Zap,
                title: 'IA Integrada',
                desc: 'Aproveite modelos de IA avançados para automação de tarefas'
              },
              {
                icon: Shield,
                title: 'Segurança Enterprise',
                desc: 'Autenticação segura, criptografia e controle de acesso granular'
              },
              {
                icon: BarChart3,
                title: 'Analytics em Tempo Real',
                desc: 'Visualize métricas e relatórios detalhados de operações'
              }
            ].map((feature, idx) => (
              <div key={idx} className="card-industrial p-8 space-y-4 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="card-industrial p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Pronto para começar?</h2>
            <p className="text-muted-foreground text-lg">
              Junte-se a empresas que confiam em AITI Manager para gerenciar suas operações de IA
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Acessar Agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6 text-center text-muted-foreground text-sm">
        <p>© 2024 AITINET. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { Eye, ExternalLink, Sliders, Sparkles } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { Badge, Button, Card, SectionTitle } from '../common/DesignSystem';
import { LandingCustomizerTab } from './settings/LandingCustomizerTab';
import { PresetsPortabilityTab } from './settings/PresetsPortabilityTab';

export const WhiteLabelCustomizerModule: React.FC = () => {
  const { setCurrentView } = useHotel();
  const [activeTab, setActiveTab] = useState<'customizer' | 'presets'>('customizer');

  return (
    <div className="space-y-6">
      <Card padding="md">
        <SectionTitle
          title="Estúdio de Personalização White-Label"
          description="Personalize planos de fundo, cores, tipografia, seções visíveis, textos e diferenciais para cada hotel ou pousada."
          actions={(
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="warning">Multi-Tenant Ready</Badge>
              <Button variant="secondary" onClick={() => setCurrentView('landing')} title="Abrir o site público do cliente em tempo real">
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>Ver Site Ao Vivo</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          )}
        />
      </Card>

      <Card padding="sm" className="flex flex-wrap items-center gap-2">
        <Button
          variant={activeTab === 'customizer' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('customizer')}
        >
          <Sliders className="h-4 w-4" aria-hidden="true" />
          <span>Editor Visual & Elementos da Landing Page</span>
        </Button>

        <Button
          variant={activeTab === 'presets' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('presets')}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>Modelos Prontos de Clientes</span>
        </Button>
      </Card>

      {activeTab === 'customizer' ? <LandingCustomizerTab /> : <PresetsPortabilityTab />}
    </div>
  );
};

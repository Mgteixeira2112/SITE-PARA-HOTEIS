import React from 'react';
import { GovernancaWorkspace } from './GovernancaWorkspace';
import { GOVERNANCA_DIRECT_DEFINITION } from './governancaDirectDefinition';

/**
 * Entrada estável da rota direta de Governança no NovoHotel.
 *
 * O router principal conhece apenas esta página. O contrato visual legado
 * necessário pela tela especializada fica confinado no próprio módulo de
 * Governança até a remoção completa dos tipos de Workspace de sua implementação.
 */
export const GovernancaDirectPage: React.FC = () => (
  <GovernancaWorkspace definition={GOVERNANCA_DIRECT_DEFINITION} />
);

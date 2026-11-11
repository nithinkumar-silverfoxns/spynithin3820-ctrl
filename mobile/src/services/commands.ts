import { apiFetch } from './api';

export type CommandSpec = {
  name: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  requires_confirmation: boolean;
  permissions: string[];
  params: string[];
};

export type Directive = { name: string; params: Record<string, unknown>; risk: string };

export type ExecuteResult = {
  status: 'authorized' | 'needs_confirmation' | 'denied';
  message: string;
  directive: Directive | null;
  confirmation_token: string | null;
  missing_permissions: string[];
};

export const commandService = {
  async catalog(): Promise<CommandSpec[]> {
    return apiFetch<CommandSpec[]>('/api/v1/commands/catalog', { auth: false });
  },

  async execute(
    name: string,
    params: Record<string, unknown>,
    grantedPermissions: string[],
    confirmationToken?: string,
  ): Promise<ExecuteResult> {
    return apiFetch<ExecuteResult>('/api/v1/commands/execute', {
      method: 'POST',
      body: {
        name,
        params,
        granted_permissions: grantedPermissions,
        confirmation_token: confirmationToken ?? null,
      },
    });
  },

  async reportResult(name: string, success: boolean, detail = ''): Promise<{ spoken_response: string }> {
    return apiFetch('/api/v1/commands/result', {
      method: 'POST',
      body: { name, success, detail },
    });
  },
};

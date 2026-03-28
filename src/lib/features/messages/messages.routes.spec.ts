import { messagesRoutes } from './messages.routes';
import { MessagesComponent } from './messages.component';

describe('messagesRoutes', () => {
  const root = messagesRoutes[0];

  it('should use MessagesComponent as root component', () => {
    expect(root.component).toBe(MessagesComponent);
  });

  it('should redirect empty path to details', () => {
    const redirect = root.children!.find((r) => r.path === '' && r.redirectTo);
    expect(redirect).toBeDefined();
    expect(redirect!.redirectTo).toBe('details');
  });

  it('should have details route with loadComponent', () => {
    const route = root.children!.find((r) => r.path === 'details' && r.loadComponent);
    expect(route).toBeDefined();
    expect(route!.loadComponent).toBeTypeOf('function');
  });

  it('should have details/message/:messageId route', () => {
    const route = root.children!.find((r) => r.path === 'details/message/:messageId');
    expect(route).toBeDefined();
    expect(route!.loadComponent).toBeTypeOf('function');
  });

  it('should have table and map routes', () => {
    const table = root.children!.find((r) => r.path === 'table');
    const map = root.children!.find((r) => r.path === 'map');
    expect(table).toBeDefined();
    expect(map).toBeDefined();
    expect(table!.loadComponent).toBeTypeOf('function');
    expect(map!.loadComponent).toBeTypeOf('function');
  });
});

import { createNiordRoutes } from './create-niord-routes';
import { LayoutComponent } from '../shared/components/layout/layout.component';

describe('createNiordRoutes()', () => {
  const routes = createNiordRoutes();

  it('should return a Routes array', () => {
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should redirect root to messages/details', () => {
    const root = routes.find((r) => r.path === '' && r.redirectTo);
    expect(root).toBeDefined();
    expect(root!.redirectTo).toBe('messages/details');
    expect(root!.pathMatch).toBe('full');
  });

  it('should have print route outside LayoutComponent', () => {
    const print = routes.find((r) => r.path === 'messages/print');
    expect(print).toBeDefined();
    expect(print!.component).toBeUndefined();
    expect(print!.loadComponent).toBeDefined();
  });

  it('should wrap messages under LayoutComponent', () => {
    const layout = routes.find((r) => r.component === LayoutComponent);
    expect(layout).toBeDefined();
    const messagesChild = layout!.children!.find((c) => c.path === 'messages');
    expect(messagesChild).toBeDefined();
    expect(messagesChild!.loadChildren).toBeDefined();
  });

  it('should wrap publications under LayoutComponent', () => {
    const layout = routes.find((r) => r.component === LayoutComponent);
    const pubChild = layout!.children!.find((c) => c.path === 'publications');
    expect(pubChild).toBeDefined();
    expect(pubChild!.loadComponent).toBeDefined();
  });

  it('should have wildcard redirect to messages/details', () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard).toBeDefined();
    expect(wildcard!.redirectTo).toBe('messages/details');
  });
});

import { publicationsRoutes } from './publications.routes';

describe('publicationsRoutes', () => {
  it('should have a single route at empty path', () => {
    expect(publicationsRoutes).toHaveLength(1);
    expect(publicationsRoutes[0].path).toBe('');
  });

  it('should have loadComponent function', () => {
    expect(publicationsRoutes[0].loadComponent).toBeTypeOf('function');
  });
});

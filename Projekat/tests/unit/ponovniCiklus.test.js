const { inkrementirajPonovniCiklus, labelPonovnogCiklusa } = require('@/lib/servisirane/ponovniCiklus');

describe('labelPonovnogCiklusa', () => {
  test('null za 0', () => expect(labelPonovnogCiklusa(0)).toBeNull());
  test('prvi ciklus', () => expect(labelPonovnogCiklusa(1)).toBe('Nije riješeno iz prve'));
  test('više ciklusa', () => expect(labelPonovnogCiklusa(2)).toBe('Ponovni ciklus (2)'));
});

describe('inkrementirajPonovniCiklus', () => {
  test('koristi RPC kada vrati broj', async () => {
    const db = {
      rpc: jest.fn().mockResolvedValue({ data: 3, error: null }),
      from: jest.fn(),
    };
    await expect(inkrementirajPonovniCiklus(db, 1)).resolves.toBe(3);
    expect(db.from).not.toHaveBeenCalled();
  });

  test('fallback UPDATE kada RPC ne uspije', async () => {
    const single = jest.fn().mockResolvedValue({
      data: { broj_ponovnih_ciklusa: 2 },
      error: null,
    });
    const maybeSingle = jest.fn().mockResolvedValue({
      data: { broj_ponovnih_ciklusa: 1 },
      error: null,
    });
    const db = {
      rpc: jest.fn().mockResolvedValue({ data: null, error: { message: 'function not found' } }),
      from: jest.fn((table) => {
        if (table !== 'service_requests') throw new Error('unexpected table');
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({ single })),
            })),
          })),
        };
      }),
    };
    await expect(inkrementirajPonovniCiklus(db, 5)).resolves.toBe(2);
    expect(maybeSingle).toHaveBeenCalled();
    expect(single).toHaveBeenCalled();
  });

  test('baca grešku kada ni RPC ni fallback ne uspiju', async () => {
    const db = {
      rpc: jest.fn().mockResolvedValue({ data: null, error: { message: 'rpc fail' } }),
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
    };
    await expect(inkrementirajPonovniCiklus(db, 1)).rejects.toThrow(/RPC/i);
  });
});

/** @jest-environment node */

const mockInsert = jest.fn();

jest.mock('@supabase/supabase-js', () => ({}), { virtual: true });

const { safeInsertPremiumEvent } = require('@/lib/premium/lifecycle');

function mockSupabase(insertResult) {
  mockInsert.mockResolvedValue(insertResult);
  return {
    from: () => ({
      insert: mockInsert,
    }),
  };
}

describe('safeInsertPremiumEvent', () => {
  beforeEach(() => {
    mockInsert.mockReset();
  });

  test('returns ok on successful insert', async () => {
    const supabase = mockSupabase({ error: null });
    const rez = await safeInsertPremiumEvent(supabase, {
      user_id: 'u1',
      actor_user_id: 'u1',
      event_type: 'premium_activated',
      payload_json: {},
    });
    expect(rez).toEqual({ ok: true });
  });

  test('returns ok when premium_events table is missing', async () => {
    const supabase = mockSupabase({
      error: { message: 'relation "public.premium_events" does not exist' },
    });
    const rez = await safeInsertPremiumEvent(supabase, {
      user_id: 'u1',
      actor_user_id: 'u1',
      event_type: 'premium_checkout_started',
      payload_json: {},
    });
    expect(rez).toEqual({ ok: true });
  });

  test('returns error on RLS failure (must be fixed via DB policy)', async () => {
    const supabase = mockSupabase({
      error: {
        message:
          'new row violates row-level security policy for table "premium_events"',
      },
    });
    const rez = await safeInsertPremiumEvent(supabase, {
      user_id: 'u1',
      actor_user_id: 'u1',
      event_type: 'premium_activated',
      payload_json: {},
    });
    expect(rez.ok).toBe(false);
    expect(rez.message).toContain('row-level security');
  });
});

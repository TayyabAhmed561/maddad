-- Auto-create donor profile on auth.users INSERT.
-- ON CONFLICT DO NOTHING ensures existing rows (with elevated roles) are never downgraded.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.donors (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'donor',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Spusťte toto v Supabase SQL Editoru pro nastavení přístupu Administrátora

-- 1. Vytvoření tabulky pro role uživatelů (pokud chcete spravovat role odděleně od auth.users)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid REFERENCES auth.users(id) PRIMARY KEY,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Nastavení RLS pro tabulku user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Každý si může přečíst svou roli
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Umožnit adminům smazat inzeráty
-- Přidáme smazávací pravidlo na tabulku listings
CREATE POLICY "Admins can delete listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Obyčejní uživatelé si mohou smazat SVÉ VLASTNÍ inzeráty
CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Vytvoření administrátorského účtu pro váš konkrétní uživatelský profil:
INSERT INTO public.user_roles (user_id, role) VALUES ('7348d36e-9f32-4952-8666-9ed90133e48c', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

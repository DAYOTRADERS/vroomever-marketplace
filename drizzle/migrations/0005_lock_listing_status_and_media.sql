DROP POLICY IF EXISTS "Product media readable when listed" ON storage.objects;

CREATE OR REPLACE FUNCTION public.guard_product_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'secretary') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NEW.status NOT IN ('pending','hidden') THEN
    RAISE EXCEPTION 'Listings must be approved by an administrator';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS products_guard_status ON public.products;
CREATE TRIGGER products_guard_status BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.guard_product_status();
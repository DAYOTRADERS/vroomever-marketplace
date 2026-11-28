CREATE TABLE public.subcategory_prices (
 category_slug text NOT NULL REFERENCES public.categories(slug) ON DELETE CASCADE,
 subcategory text NOT NULL,
 monthly_ksh integer NOT NULL DEFAULT 150 CHECK (monthly_ksh BETWEEN 150 AND 2500),
 annual_ksh integer NOT NULL DEFAULT 1500 CHECK (annual_ksh BETWEEN 150 AND 2500),
 PRIMARY KEY(category_slug, subcategory),
 CHECK (monthly_ksh < annual_ksh)
);
GRANT SELECT ON public.subcategory_prices TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subcategory_prices TO authenticated;
GRANT ALL ON public.subcategory_prices TO service_role;
ALTER TABLE public.subcategory_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listing package prices public" ON public.subcategory_prices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage listing prices" ON public.subcategory_prices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.subcategory_prices(category_slug,subcategory) SELECT c.slug, s FROM public.categories c CROSS JOIN LATERAL unnest(c.subcategories) s;
CREATE FUNCTION public.sync_subcategory_prices() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.subcategory_prices(category_slug,subcategory) SELECT NEW.slug,s FROM unnest(NEW.subcategories) s ON CONFLICT DO NOTHING;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_subcategory_prices() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER sync_category_listing_prices AFTER INSERT OR UPDATE OF subcategories ON public.categories FOR EACH ROW EXECUTE FUNCTION public.sync_subcategory_prices();
ALTER TABLE public.products ADD COLUMN brand text, ADD COLUMN listing_cadence text, ADD COLUMN listing_fee_ksh integer, ADD COLUMN listing_expires_at timestamptz;
CREATE FUNCTION public.set_listing_package() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE chosen public.subcategory_prices;
BEGIN
 IF NEW.listing_cadence IS NULL THEN RETURN NEW; END IF;
 IF NEW.listing_cadence NOT IN ('monthly','annual') THEN RAISE EXCEPTION 'Choose a monthly or annual listing package'; END IF;
 SELECT * INTO chosen FROM public.subcategory_prices WHERE category_slug=NEW.category_slug AND subcategory=NEW.subcategory;
 IF NOT FOUND THEN RAISE EXCEPTION 'Choose an available subcategory'; END IF;
 NEW.listing_fee_ksh := CASE WHEN NEW.listing_cadence='monthly' THEN chosen.monthly_ksh ELSE chosen.annual_ksh END;
 NEW.listing_expires_at := now() + CASE WHEN NEW.listing_cadence='monthly' THEN interval '1 month' ELSE interval '1 year' END;
 RETURN NEW;
END;
$$;
CREATE TRIGGER set_product_listing_package BEFORE INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_listing_package();
DROP POLICY "Active products are public" ON public.products;
CREATE POLICY "Active products are public" ON public.products FOR SELECT TO public USING (status='active' AND (listing_expires_at IS NULL OR listing_expires_at>now()));
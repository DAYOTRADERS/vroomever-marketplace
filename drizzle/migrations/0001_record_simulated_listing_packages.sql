ALTER TABLE public.products ADD COLUMN listing_payment_method text;
CREATE FUNCTION public.record_listing_simulation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.listing_cadence IS NOT NULL AND NEW.listing_fee_ksh IS NOT NULL THEN
  IF auth.uid() IS NULL OR auth.uid() <> NEW.seller_id THEN RAISE EXCEPTION 'Sign in as the listing seller'; END IF;
  IF NEW.listing_payment_method IS NULL OR NEW.listing_payment_method NOT IN ('mpesa','card') THEN RAISE EXCEPTION 'Select a simulated payment method'; END IF;
  INSERT INTO public.payments(user_id,amount_ksh,method,status,purpose,reference) VALUES(NEW.seller_id,NEW.listing_fee_ksh,NEW.listing_payment_method,'simulated','Simulated listing package: '||NEW.subcategory||' / '||NEW.listing_cadence,NEW.id::text);
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.record_listing_simulation() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER record_product_listing_simulation AFTER INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION public.record_listing_simulation();
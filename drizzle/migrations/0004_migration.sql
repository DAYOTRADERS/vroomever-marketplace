ALTER TABLE public.subcategory_prices ADD COLUMN IF NOT EXISTS weekly_ksh integer NOT NULL DEFAULT 50;
ALTER TABLE public.subcategory_prices ADD CONSTRAINT subcategory_prices_weekly_ksh_check CHECK (weekly_ksh >= 50 AND weekly_ksh <= 2500);
ALTER TABLE public.subcategory_prices ADD CONSTRAINT subcategory_prices_weekly_lte_monthly CHECK (weekly_ksh <= monthly_ksh);
CREATE OR REPLACE FUNCTION public.set_listing_package()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
DECLARE chosen public.subcategory_prices;
BEGIN
 IF NEW.listing_cadence IS NULL THEN RETURN NEW; END IF;
 IF NEW.listing_cadence NOT IN ('weekly','monthly','annual') THEN RAISE EXCEPTION 'Choose a weekly, monthly or yearly listing package'; END IF;
 SELECT * INTO chosen FROM public.subcategory_prices WHERE category_slug=NEW.category_slug AND subcategory=NEW.subcategory;
 IF NOT FOUND THEN RAISE EXCEPTION 'Choose an available subcategory'; END IF;
 NEW.listing_fee_ksh := CASE NEW.listing_cadence WHEN 'weekly' THEN chosen.weekly_ksh WHEN 'monthly' THEN chosen.monthly_ksh ELSE chosen.annual_ksh END;
 NEW.listing_expires_at := now() + CASE NEW.listing_cadence WHEN 'weekly' THEN interval '7 days' WHEN 'monthly' THEN interval '1 month' ELSE interval '1 year' END;
 RETURN NEW;
END;
$function$;
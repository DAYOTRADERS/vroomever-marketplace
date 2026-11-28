
CREATE TYPE public.app_role AS ENUM ('admin','seller','buyer');
CREATE TYPE public.product_status AS ENUM ('pending','active','hidden','rejected');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  location text,
  about text,
  avatar_url text,
  id_document_url text,
  id_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Profiles are publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.categories (
  slug text PRIMARY KEY,
  name text NOT NULL,
  subcategories text[] NOT NULL DEFAULT '{}',
  position int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.subscription_packages (
  id text PRIMARY KEY,
  name text NOT NULL,
  cadence text NOT NULL,
  price_ksh integer NOT NULL,
  listing_limit integer NOT NULL,
  description text,
  popular boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.subscription_packages TO anon, authenticated;
GRANT ALL ON public.subscription_packages TO service_role;
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Packages are public" ON public.subscription_packages FOR SELECT USING (true);
CREATE POLICY "Admins manage packages" ON public.subscription_packages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_slug text NOT NULL REFERENCES public.categories(slug),
  subcategory text,
  title text NOT NULL,
  description text,
  price_ksh numeric(12,2) NOT NULL DEFAULT 0,
  location text,
  condition text,
  images text[] NOT NULL DEFAULT '{}',
  video_url text,
  status public.product_status NOT NULL DEFAULT 'pending',
  is_vip boolean NOT NULL DEFAULT false,
  vip_expires_at timestamptz,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products are public" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers read own products" ON public.products FOR SELECT TO authenticated USING (auth.uid() = seller_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Sellers create own products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers update own products" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = seller_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = seller_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Sellers delete own products" ON public.products FOR DELETE TO authenticated USING (auth.uid() = seller_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.enforce_media_limits()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF array_length(NEW.images, 1) > 5 THEN
    RAISE EXCEPTION 'A listing can have at most 5 photos';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER products_media_limits BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.enforce_media_limits();

CREATE TABLE public.favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id text NOT NULL REFERENCES public.subscription_packages(id),
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own subscriptions" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscriptions" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ksh integer NOT NULL,
  method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  purpose text,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own payments" ON public.payments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE chosen public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;

  chosen := CASE WHEN NEW.raw_user_meta_data->>'role' = 'seller' THEN 'seller'::public.app_role ELSE 'buyer'::public.app_role END;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, chosen) ON CONFLICT DO NOTHING;
  IF chosen = 'seller' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.subscription_packages (id,name,cadence,price_ksh,listing_limit,description,popular) VALUES
('bronze','Bronze','monthly',1500,15,'Start selling with the essentials.',false),
('silver','Silver','monthly',3500,50,'Built for growing businesses.',true),
('gold','Gold','yearly',24000,250,'Maximum reach for established stores.',false);

INSERT INTO public.categories (slug,name,subcategories,position) VALUES
('cars','Cars','{"Cars","Vehicle Parts","Motorcycles","Buses","Trucks","Heavy Machinery","Boats","Personal Mobility","Car Services"}',1),
('fashion','Fashion','{"Women''s Clothing","Men''s Clothing","Shoes","Bags","Watches","Jewellery","Accessories"}',2),
('food-stuff','Food Stuff','{"Cereals","Fresh Produce","Beverages","Dairy","Meat & Poultry","Snacks","Wholesale Food"}',3),
('gem-stones','Gem Stones','{"Cut Gemstones","Rough Stones","Gold","Silver","Minerals","Jewellery Tools"}',4),
('furniture','Furniture','{"Sofas","Beds","Dining","Office Furniture","Outdoor","Décor","Storage"}',5),
('property','Property','{"Houses for Sale","Apartments","Land","Commercial","Short Lets","Property Services"}',6),
('leisure','Leisure','{"Sports Equipment","Musical Instruments","Books","Gaming","Camping","Collectibles"}',7),
('phones-tablets','Phones & Tablets','{"Smartphones","Tablets","Accessories","Smart Watches","Feature Phones","Repairs"}',8),
('beauty','Beauty & Personal Care','{"Skincare","Hair Care","Fragrance","Makeup","Personal Care","Salon Equipment"}',9),
('repair-construction','Repair & Construction','{"Building Materials","Power Tools","Plumbing","Electrical","Hand Tools","Contractors"}',10),
('commercial-equipment','Commercial Equipment','{"Restaurant Equipment","Medical Equipment","Printing","Retail Equipment","Industrial Tools"}',11),
('babies-kids','Babies & Kids','{"Baby Clothing","Toys","Prams","Kids Furniture","School Supplies","Maternity"}',12),
('animals-pets','Animals & Pets','{"Dogs","Cats","Farm Animals","Birds","Pet Food","Pet Services"}',13),
('jobs','Jobs','{"Technology","Sales","Hospitality","Construction","Healthcare","Remote Work"}',14),
('business-industry','Business & Industry','{"Manufacturing","Agriculture","Office Equipment","Wholesale","Business Sales"}',15),
('services','Services','{"Cleaning","Transport","Photography","Events","Tutoring","Health & Wellness","Professional"}',16);

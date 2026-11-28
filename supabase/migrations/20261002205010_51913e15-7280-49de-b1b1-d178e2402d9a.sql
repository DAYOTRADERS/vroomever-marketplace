ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE TABLE public.product_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL,
  buyer_id uuid,
  channel text NOT NULL CHECK (channel IN ('whatsapp','call')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.product_enquiries TO authenticated;
GRANT INSERT ON public.product_enquiries TO anon;
GRANT ALL ON public.product_enquiries TO service_role;
ALTER TABLE public.product_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone logs enquiries on active listings" ON public.product_enquiries FOR INSERT TO anon, authenticated
  WITH CHECK ((buyer_id IS NULL OR buyer_id = auth.uid()) AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = product_enquiries.seller_id AND p.status = 'active'));
CREATE POLICY "Seller or admin reads enquiries" ON public.product_enquiries FOR SELECT TO authenticated
  USING (seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX ON public.product_enquiries (seller_id, created_at);

CREATE OR REPLACE FUNCTION public.record_product_view(_product_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.products SET views = views + 1 WHERE id = _product_id AND status = 'active';
$$;
GRANT EXECUTE ON FUNCTION public.record_product_view(uuid) TO anon, authenticated;
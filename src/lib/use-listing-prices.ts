import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
export function useListingPrices() {
  return useQuery({ queryKey: ["subcategory-prices"], queryFn: async () => {
    const { data, error } = await supabase.from("subcategory_prices").select("*");
    if (error) throw error;
    return data;
  }, staleTime: 0 });
}
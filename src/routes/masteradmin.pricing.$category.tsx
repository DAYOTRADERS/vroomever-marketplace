import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/vroomever/admin-pages";
import { AdminListingPrices } from "@/components/vroomever/admin-listing-prices";
import { Seo } from "@/components/vroomever/marketplace-pages";
export const Route=createFileRoute("/masteradmin/pricing/$category")({head:({params})=>Seo(`${params.category} listing prices — VRUMEVER Admin`,"Manage monthly and annual subcategory listing fees on VRUMEVER."),component:PricingPage});
function PricingPage(){const {category}=Route.useParams();return <AdminShell><Button asChild variant="ghost" size="sm" className="mb-3"><Link to="/masteradmin/categories"><ArrowLeft/>Back</Link></Button><AdminListingPrices category={category}/></AdminShell>;}
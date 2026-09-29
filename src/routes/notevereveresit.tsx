import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brand } from "@/components/vroomever/brand";
import { Seo } from "@/components/vroomever/marketplace-pages";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/notevereveresit")({
  head: () => Seo("Administrator account — VroomEver", "Create a VroomEver administrator account."),
  component: AdminSetupPage,
});

function AdminSetupPage() {
  const [email,setEmail]=useState("");
  const [fullName,setFullName]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  const submit=async(event:FormEvent)=>{
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      const {data:sessionData}=await supabase.auth.getSession();
      const session=sessionData.session;

      if (session) {
        const {data:profile}=await supabase.from("profiles").select("role").eq("id",session.user.id).maybeSingle();
        if (profile?.role !== "admin") {
          setError("Only an authenticated administrator can create another administrator account.");
          return;
        }

        const {data,error:fnError}=await supabase.functions.invoke("admin-create-user",{
          body:{email:email.trim(),fullName:fullName.trim(),password},
        });
        if(fnError) throw new Error(fnError.message || "Administrator account creation failed.");
        if(data?.error) throw new Error(String(data.error));
        setMessage("Administrator account created successfully. It can now sign in at /masteradmin.");
        setEmail(""); setFullName(""); setPassword("");
        return;
      }

      const {data:adminExists,error:checkError}=await supabase.rpc("admin_exists");
      if(checkError) throw checkError;
      if(adminExists) {
        setError("An administrator already exists. Sign in to /masteradmin with the existing administrator, then return here to create another administrator.");
        return;
      }

      const {data,error:signupError}=await supabase.auth.signUp({
        email:email.trim(),
        password,
        options:{data:{full_name:fullName.trim()}},
      });
      if(signupError) throw signupError;

      if(!data.session){
        setMessage("Account created. Confirm the email if required, then sign in at /masteradmin. The first administrator role is assigned after successful authenticated setup.");
        return;
      }

      const {error:bootstrapError}=await supabase.rpc("bootstrap_first_admin",{target_full_name:fullName.trim()});
      if(bootstrapError) throw bootstrapError;

      setMessage("Administrator created successfully. You can now sign in at /masteradmin.");
      setEmail(""); setFullName(""); setPassword("");
      await supabase.auth.signOut();
    } catch(err) {
      setError(err instanceof Error ? err.message : "Administrator account creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="grid min-h-screen place-items-center bg-surface-strong px-5 text-surface-foreground">
    <form onSubmit={submit} className="w-full max-w-md rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <Brand inverted/>
      <h1 className="mt-8 font-display text-3xl font-bold">Create admin account</h1>
      <p className="mt-2 text-sm text-surface-muted">Use this page only for VroomEver administrator accounts.</p>
      {error&&<p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {message&&<p className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">{message}</p>}
      <label className="mt-6 block text-sm">Full name<Input value={fullName} onChange={e=>setFullName(e.target.value)} required autoComplete="name" className="mt-2 h-11 bg-background text-foreground"/></label>
      <label className="mt-4 block text-sm">Admin email<Input value={email} onChange={e=>setEmail(e.target.value)} required type="email" autoComplete="email" className="mt-2 h-11 bg-background text-foreground"/></label>
      <label className="mt-4 block text-sm">Password<Input value={password} onChange={e=>setPassword(e.target.value)} required type="password" minLength={8} autoComplete="new-password" className="mt-2 h-11 bg-background text-foreground"/></label>
      <Button className="mt-6 w-full" size="lg" type="submit" disabled={loading}>{loading?"Creating…":"Create administrator"}</Button>
    </form>
  </div>;
}

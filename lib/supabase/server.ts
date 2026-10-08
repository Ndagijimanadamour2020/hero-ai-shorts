import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export async function supabaseServer(){const jar=await cookies();return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll(){return jar.getAll()},setAll(cookiesToSet){try{cookiesToSet.forEach(({name,value,options})=>jar.set(name,value,options))}catch{}}}})}
export async function requireUser(){const db=await supabaseServer();const {data:{user},error}=await db.auth.getUser();if(error||!user)throw new Error('Unauthorized');return user}

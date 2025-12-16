-- Fix the handle_new_user function to use gen_random_uuid instead of gen_random_bytes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, qr_code_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    replace(gen_random_uuid()::text, '-', '')
  );
  
  -- Default role is 'user' (civilian)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;
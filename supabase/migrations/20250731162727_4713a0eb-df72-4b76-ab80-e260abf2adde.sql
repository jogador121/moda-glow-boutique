-- Set user schimitdalice@gmail.com as admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'schimitdalice@gmail.com';

-- If profile doesn't exist, create it first (in case the user signed up with Google)
INSERT INTO public.profiles (user_id, email, role, full_name)
SELECT id, email, 'admin', COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
FROM auth.users 
WHERE email = 'schimitdalice@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'schimitdalice@gmail.com'
);
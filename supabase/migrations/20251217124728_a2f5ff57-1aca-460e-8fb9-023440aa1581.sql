-- Create shelters table
CREATE TABLE public.shelters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  contact_phone TEXT,
  amenities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage shelters" ON public.shelters FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Operators can manage shelters" ON public.shelters FOR ALL USING (has_role(auth.uid(), 'operator'::app_role));
CREATE POLICY "Public can view open shelters" ON public.shelters FOR SELECT USING (status = 'open');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.shelters;

-- Add updated_at trigger
CREATE TRIGGER update_shelters_updated_at BEFORE UPDATE ON public.shelters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
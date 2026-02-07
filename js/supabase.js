import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabaseUrl = "https://kglmusilzoixvqfgyvlv.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnbG11c2lsem9peHZxZmd5dmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTIzMTUsImV4cCI6MjA4NTEyODMxNX0.scUytKXFHaNI1VZcHSzUmKoqpMKCKGxm7RXquirHNHc"

export const supabase = createClient(supabaseUrl, supabaseKey)
window.supabase = supabase;

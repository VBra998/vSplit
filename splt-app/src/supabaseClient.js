import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://taveaagknlwwfnnqflhv.supabase.co";
const supabasePublishableKey = "sb_publishable_T_TpG3GhmORV3rx6SoHpEA_ZlX6yeek";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

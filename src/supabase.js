import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Bağlantı testi
supabase.from('athletes').select('*').then(({ data, error }) => {
  if (error) console.error('Supabase bağlantı hatası:', error)
  else console.log('Supabase bağlantısı başarılı! Veri:', data)
})
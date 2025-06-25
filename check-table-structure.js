import { createClient } from '@supabase/supabase-js'

// Create the client (you'll need to replace with your actual credentials)
const supabaseUrl = 'https://your-project-url.supabase.co'
const supabaseAnonKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDetalleComprasStructure() {
  console.log('🔍 Checking detalle_compras table structure...')

  try {
    // First, let's try to get any record to see what columns exist
    const { data: sampleData, error: sampleError } = await supabase
      .from('detalle_compras')
      .select('*')
      .limit(1)

    if (sampleError) {
      console.error('❌ Error fetching sample data:', sampleError)
      return
    }

    if (sampleData && sampleData.length > 0) {
      console.log('📊 Sample record from detalle_compras:')
      console.log(JSON.stringify(sampleData[0], null, 2))
      console.log('\n📋 Available columns:')
      Object.keys(sampleData[0]).forEach((key) => {
        console.log(`  - ${key}: ${typeof sampleData[0][key]} (${sampleData[0][key]})`)
      })
    } else {
      console.log('⚠️ No data found in detalle_compras table')
    }

    // Also check if there are any records at all
    const { count, error: countError } = await supabase
      .from('detalle_compras')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error getting count:', countError)
    } else {
      console.log(`📊 Total records in detalle_compras: ${count}`)
    }
  } catch (error) {
    console.error('❌ General error:', error)
  }
}

checkDetalleComprasStructure()

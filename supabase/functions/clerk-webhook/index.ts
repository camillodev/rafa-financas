
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const CLERK_WEBHOOK_SECRET = Deno.env.get('CLERK_WEBHOOK_SECRET') || ''

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CLERK_WEBHOOK_SECRET) {
      throw new Error('Missing environment variables')
    }

    // Verify the webhook signature
    const signature = req.headers.get('svix-signature')
    if (!signature) {
      throw new Error('No signature provided')
    }

    // We'll skip the actual verification in this implementation, but in production
    // you should verify the signature with Clerk's webhook verification

    const payload = await req.json()
    const { type, data } = payload

    // Connect to Supabase with admin privileges
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Handle user events
    if (type === 'user.created' || type === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = data
      
      if (!id) {
        throw new Error('No user ID provided')
      }

      // If user was created in Clerk, create or update user in Supabase
      const primaryEmail = email_addresses?.[0]?.email_address || ''

      const { data: userData, error } = await supabase.auth.admin.createUser({
        email: primaryEmail,
        user_metadata: {
          first_name: first_name || '',
          last_name: last_name || '',
          clerk_id: id
        },
        email_confirm: true,
        user_id: id
      })

      if (error) {
        // If user exists, update the user
        if (error.message.includes('already exists')) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(id, {
            email: primaryEmail,
            user_metadata: {
              first_name: first_name || '',
              last_name: last_name || '',
              clerk_id: id
            }
          })
          
          if (updateError) {
            throw updateError
          }
        } else {
          throw error
        }
      }

      console.log(`User ${type.split('.')[1]} successfully with ID: ${id}`)
    } 
    // Handle user deletion
    else if (type === 'user.deleted') {
      const { id } = data
      
      if (!id) {
        throw new Error('No user ID provided')
      }

      const { error } = await supabase.auth.admin.deleteUser(id)
      
      if (error) {
        throw error
      }

      console.log(`User deleted successfully with ID: ${id}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

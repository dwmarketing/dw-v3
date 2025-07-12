import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Activate user function called');
    
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract the JWT token and verify it manually using admin client
    const token = authHeader.replace('Bearer ', '');
    console.log('Token received:', token ? 'Yes' : 'No');

    // Verify the JWT token directly using admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    console.log('Auth verification result:', { userId: user?.id, authError: authError?.message });

    if (authError || !user) {
      console.log('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Authentication failed - invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if the user is an admin using admin client
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    console.log('User role check:', { userRole: userRole?.role, roleError: roleError?.message });

    if (roleError || userRole?.role !== 'admin') {
      console.log('Access denied - not admin:', userRole?.role);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { userId, isActive } = await req.json();
    console.log('Request data:', { userId, isActive });

    if (!userId || typeof isActive !== 'boolean') {
      console.log('Invalid request data:', { userId, isActive });
      return new Response(
        JSON.stringify({ error: 'userId and isActive (boolean) are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update user activation status
    console.log('Updating user activation status:', { userId, isActive });
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user activation status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user activation status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User activation status updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in activate-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
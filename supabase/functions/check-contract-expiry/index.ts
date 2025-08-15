import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONTRACT-EXPIRY-CHECK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting contract expiry check");

    // Use service role key to bypass RLS for system operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Notification thresholds in days
    const notificationThresholds = [
      { days: 80, type: '80_days' },
      { days: 45, type: '45_days' },
      { days: 30, type: '30_days' },
      { days: 14, type: '2_weeks' },
      { days: 7, type: '1_week' },
      { days: 5, type: '5_days' },
      { days: 3, type: '3_days' },
      { days: 2, type: '2_days' },
      { days: 1, type: '24_hours' },
      { days: 0, type: 'contract_ended' }
    ];

    // Get all active clients with contract end dates
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, assigned_ssc, team, end_date')
      .not('assigned_ssc', 'is', null)
      .not('end_date', 'is', null);

    if (clientsError) {
      throw new Error(`Error fetching clients: ${clientsError.message}`);
    }

    logStep("Fetched clients", { count: clients?.length || 0 });

    let notificationsCreated = 0;

    for (const client of clients || []) {
      const endDate = new Date(client.end_date);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      logStep(`Checking client ${client.name}`, { daysRemaining, endDate: client.end_date });

      // Check if we need to send notifications for this client
      for (const threshold of notificationThresholds) {
        if (daysRemaining === threshold.days) {
          // Check if notification already sent for this threshold
          const { data: existingNotification } = await supabase
            .from('contract_notifications')
            .select('id')
            .eq('client_id', client.id)
            .eq('notification_type', threshold.type)
            .single();

          if (!existingNotification) {
            // Create new notification
            const { error: insertError } = await supabase
              .from('contract_notifications')
              .insert({
                client_id: client.id,
                days_remaining: daysRemaining,
                notification_type: threshold.type,
                assigned_ssc: client.assigned_ssc,
                team: client.team,
                client_name: client.name,
                contract_end_date: client.end_date,
              });

            if (insertError) {
              logStep(`Error creating notification for ${client.name}`, { error: insertError.message });
            } else {
              notificationsCreated++;
              logStep(`Created ${threshold.type} notification for ${client.name}`, { daysRemaining });
            }
          }
        }
      }
    }

    logStep("Contract expiry check completed", { notificationsCreated });

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsCreated,
        clientsChecked: clients?.length || 0
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in contract expiry check", { message: errorMessage });

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
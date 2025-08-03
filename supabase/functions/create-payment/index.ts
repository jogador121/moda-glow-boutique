import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Iniciando processamento de pagamento");
    
    const { order_id, amount, items } = await req.json();
    
    logStep('Dados recebidos', { order_id, amount, items_count: items?.length });

    // Validações
    if (!order_id || !amount || !items || !Array.isArray(items)) {
      throw new Error("Dados inválidos: order_id, amount e items são obrigatórios");
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    
    logStep("Inicializando Stripe");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Initialize Supabase
    const supabaseServiceRole = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    logStep("Criando sessão de checkout", { order_id, amount });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Convert to centavos
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/pedido-confirmado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/carrinho`,
      metadata: {
        order_id: order_id,
      },
    });

    logStep('Sessão Stripe criada com sucesso', { session_id: session.id });

    // Atualizar pedido com session_id correto
    const { error: updateError } = await supabaseServiceRole
      .from('orders')
      .update({ 
        payment_id: session.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id);

    if (updateError) {
      logStep('Erro ao atualizar pedido', { error: updateError.message });
      throw new Error(`Erro ao atualizar pedido: ${updateError.message}`);
    }

    logStep('Pedido atualizado com session_id', { order_id, session_id: session.id });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERRO ao criar sessão de pagamento', { error: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Erro ao processar pagamento. Tente novamente."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
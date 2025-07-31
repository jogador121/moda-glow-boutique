import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook recebido da Stripe");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseServiceRole = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("Assinatura da Stripe não encontrada");
    }

    // Verificar webhook com endpoint secret (configurar no Stripe Dashboard)
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (error) {
      logStep("Erro na verificação do webhook", { error: error.message });
      return new Response(`Webhook Error: ${error.message}`, { status: 400 });
    }

    logStep("Evento verificado", { type: event.type, id: event.id });

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabaseServiceRole);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabaseServiceRole);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabaseServiceRole);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseServiceRole);
        break;

      default:
        logStep("Evento não processado", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO no webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Função para processar checkout concluído
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  logStep("Processando checkout concluído", { session_id: session.id });

  try {
    // Buscar pedido pelo stripe session id
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_id', session.id);

    if (orderError) throw orderError;

    if (orders && orders.length > 0) {
      const order = orders[0];
      
      // Atualizar status do pedido
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Liberar estoque reservado (se houver sistema de reserva)
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', order.id);

      if (orderItems) {
        for (const item of orderItems) {
          await supabase.rpc('reduce_stock', {
            product_id: item.product_id,
            quantity: item.quantity
          });
        }
      }

      logStep("Pedido atualizado com sucesso", { order_id: order.id });
    }
  } catch (error) {
    logStep("Erro ao processar checkout", { error: error.message });
    throw error;
  }
}

// Função para processar pagamento bem-sucedido
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  logStep("Pagamento bem-sucedido", { payment_intent_id: paymentIntent.id });
  
  // Implementar lógica adicional se necessário
  // Por exemplo, enviar emails de confirmação, atualizar analytics, etc.
}

// Função para processar falha no pagamento
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  logStep("Falha no pagamento", { payment_intent_id: paymentIntent.id });
  
  // Implementar lógica para falhas de pagamento
  // Por exemplo, notificar usuário, liberar estoque reservado, etc.
}

// Função para processar pagamento de fatura (assinaturas)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  logStep("Pagamento de fatura bem-sucedido", { invoice_id: invoice.id });
  
  // Implementar lógica para assinaturas se necessário
}
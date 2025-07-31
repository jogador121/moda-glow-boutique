import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-STRIPE-PRODUCTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Iniciando sincronização com Stripe Products API");

    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autorização necessário");
    }

    // Inicializar clientes
    const supabaseServiceRole = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Buscar produtos locais sem stripe_product_id
    const { data: products, error: productsError } = await supabaseServiceRole
      .from('products')
      .select('*')
      .is('stripe_product_id', null)
      .eq('is_active', true);

    if (productsError) throw productsError;
    logStep("Produtos encontrados para sincronizar", { count: products?.length || 0 });

    const results = [];

    for (const product of products || []) {
      try {
        logStep("Sincronizando produto", { id: product.id, name: product.name });

        // Criar produto no Stripe
        const stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description || undefined,
          images: product.images || [],
          metadata: {
            local_product_id: product.id,
            sku: product.sku || '',
          },
          active: product.is_active,
        });

        // Criar preço no Stripe
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(product.price * 100), // Converter para centavos
          currency: 'brl',
          metadata: {
            local_product_id: product.id,
          },
        });

        // Atualizar produto local com IDs do Stripe
        const { error: updateError } = await supabaseServiceRole
          .from('products')
          .update({
            stripe_product_id: stripeProduct.id,
            stripe_price_id: stripePrice.id,
            stripe_metadata: {
              stripe_product_id: stripeProduct.id,
              stripe_price_id: stripePrice.id,
              last_sync: new Date().toISOString(),
            },
            last_stripe_sync: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (updateError) throw updateError;

        // Log de sincronização
        await supabaseServiceRole
          .from('stripe_sync_logs')
          .insert({
            product_id: product.id,
            action: 'create',
            stripe_product_id: stripeProduct.id,
            stripe_price_id: stripePrice.id,
            status: 'success',
            sync_data: {
              stripe_product: stripeProduct,
              stripe_price: stripePrice,
            },
          });

        results.push({
          product_id: product.id,
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
          status: 'success',
        });

        logStep("Produto sincronizado com sucesso", { 
          product_id: product.id, 
          stripe_product_id: stripeProduct.id 
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logStep("Erro ao sincronizar produto", { product_id: product.id, error: errorMessage });

        // Log de erro
        await supabaseServiceRole
          .from('stripe_sync_logs')
          .insert({
            product_id: product.id,
            action: 'create',
            status: 'error',
            error_message: errorMessage,
          });

        results.push({
          product_id: product.id,
          status: 'error',
          error: errorMessage,
        });
      }
    }

    logStep("Sincronização concluída", { total: results.length });

    return new Response(JSON.stringify({
      success: true,
      results,
      synced_count: results.filter(r => r.status === 'success').length,
      error_count: results.filter(r => r.status === 'error').length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO na sincronização", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
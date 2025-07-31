import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface SyncResult {
  product_id: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  status: 'success' | 'error';
  error?: string;
}

const StripeSync: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      toast.info('Iniciando sincronização com Stripe...');

      const { data, error } = await supabase.functions.invoke('sync-stripe-products');

      if (error) throw error;

      setLastSync(new Date());
      setSyncResults(data.results || []);
      
      const successCount = data.synced_count || 0;
      const errorCount = data.error_count || 0;

      if (successCount > 0) {
        toast.success(`${successCount} produto(s) sincronizado(s) com sucesso!`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} produto(s) com erro na sincronização`);
      }

      if (successCount === 0 && errorCount === 0) {
        toast.info('Nenhum produto novo para sincronizar');
      }

    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro ao sincronizar com Stripe');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sincronização Stripe
        </CardTitle>
        <CardDescription>
          Sincronize produtos locais com a Stripe Products API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            {lastSync && (
              <p className="text-sm text-muted-foreground">
                Última sincronização: {lastSync.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
          <Button onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </div>

        {syncResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados da Sincronização:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {syncResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-mono">{result.product_id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                    {result.stripe_product_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(
                          `https://dashboard.stripe.com/products/${result.stripe_product_id}`,
                          '_blank'
                        )}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Produtos sem stripe_product_id serão criados na Stripe</p>
          <p>• Apenas produtos ativos são sincronizados</p>
          <p>• Preços são convertidos automaticamente para centavos (BRL)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeSync;
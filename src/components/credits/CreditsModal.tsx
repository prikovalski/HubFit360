
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, ExternalLink, Zap, Gift } from "lucide-react";
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HotmartProduct {
  hotmart_product_id: string;
  product_name: string;
  credits_amount: number;
  price: number;
}

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreditsModal = ({ isOpen, onClose }: CreditsModalProps) => {
  const [products, setProducts] = useState<HotmartProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('hotmart_products')
          .select('*')
          .eq('type', 'credits')
          .order('credits_amount', { ascending: true });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const handleBuyCredits = (productId: string) => {
    // Por enquanto, apenas log - integração com Hotmart será feita depois
    console.log('Comprar produto:', productId);
    // window.open(`https://pay.hotmart.com/...?prod=${productId}`, '_blank');
  };

  const getDiscountPercentage = (credits: number, price: number) => {
    const unitPrice = 8.90; // Preço base por crédito
    const fullPrice = credits * unitPrice;
    return Math.round((1 - price / fullPrice) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-gray-800 flex items-center justify-center gap-2">
            <Coins className="w-6 h-6 text-green-600" />
            Comprar Créditos
          </DialogTitle>
          <DialogDescription className="text-center">
            Escolha o pacote de créditos ideal para suas necessidades
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => {
                const discount = getDiscountPercentage(product.credits_amount, product.price);
                const isPopular = product.credits_amount === 5;
                
                return (
                  <Card 
                    key={product.hotmart_product_id}
                    className={`relative transition-all duration-200 hover:shadow-lg ${
                      isPopular ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
                    }`}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                        🔥 Mais Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg">{product.product_name}</CardTitle>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold text-green-600">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        {discount > 0 && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            {discount}% OFF
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Coins className="w-5 h-5 text-green-600" />
                          <span className="text-xl font-semibold">
                            {product.credits_amount} Crédito{product.credits_amount > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          = {product.credits_amount} Avaliação{product.credits_amount > 1 ? 'ões' : ''} Física{product.credits_amount > 1 ? 's' : ''}
                        </p>
                        {discount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Economize R$ {((product.credits_amount * 8.90) - product.price).toFixed(2).replace('.', ',')}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span>Créditos adicionados automaticamente</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Gift className="w-4 h-4 text-purple-500" />
                          <span>Sem data de expiração</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleBuyCredits(product.hotmart_product_id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                        size="lg"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Comprar na Hotmart
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Como funciona?</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• Após a compra na Hotmart, seus créditos são adicionados automaticamente</p>
              <p>• Use 1 crédito para cada nova avaliação física</p>
              <p>• Créditos não expiram e podem ser usados quando quiser</p>
              <p>• Pagamento 100% seguro processado pela Hotmart</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsModal;


import Layout from '../components/Layout';
import SalesForm from '../components/sales/SalesForm';
import RetroactiveSalesForm from '../components/sales/RetroactiveSalesForm';
import PaymentMethodsManager from '../components/sales/PaymentMethodsManager';
import { useStore } from '../data/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Sales = () => {
  const { products } = useStore();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground">
            Registre vendas e gerencie formas de pagamento.
          </p>
        </div>
        
        <Tabs defaultValue="register">
          <TabsList>
            <TabsTrigger value="register">Registrar Venda</TabsTrigger>
            <TabsTrigger value="retroactive">Vendas Retroativas</TabsTrigger>
            <TabsTrigger value="payment-methods">Formas de Pagamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register">
            {products.length > 0 ? (
              <SalesForm />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-muted-foreground mb-4">
                  Você precisa cadastrar produtos antes de registrar vendas.
                </p>
                <a href="/products" className="text-snack hover:underline font-medium">
                  Ir para cadastro de produtos
                </a>
              </div>
            )}
          </TabsContent>

          <TabsContent value="retroactive">
            {products.length > 0 ? (
              <RetroactiveSalesForm />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-muted-foreground mb-4">
                  Você precisa cadastrar produtos antes de registrar vendas retroativas.
                </p>
                <a href="/products" className="text-snack hover:underline font-medium">
                  Ir para cadastro de produtos
                </a>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="payment-methods">
            <div className="bg-white p-6 rounded-lg shadow">
              <PaymentMethodsManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Sales;

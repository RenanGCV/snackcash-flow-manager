
import Layout from '../components/Layout';
import SalesForm from '../components/sales/SalesForm';
import { useStore } from '../data/store';

const Sales = () => {
  const { products } = useStore();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registrar Venda</h1>
          <p className="text-muted-foreground">
            Adicione produtos e finalize a venda.
          </p>
        </div>
        
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
      </div>
    </Layout>
  );
};

export default Sales;


import Layout from '../components/Layout';
import DashboardComponent from '../components/Dashboard';

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho da sua lanchonete em tempo real.
        </p>
        
        <DashboardComponent />
      </div>
    </Layout>
  );
};

export default Dashboard;

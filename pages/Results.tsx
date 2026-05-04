import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

export default function Results() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/calculator');
  }, [navigate]);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </Layout>
  );
}

import Layout from '@/components/Layout';

export default function WageVsRent() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Wage vs Rent</h1>
        <p className="text-gray-600 mb-8">
          Compare median wages against median rents across U.S. cities to find the best affordable markets for your career.
        </p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">Wage vs Rent data coming soon.</p>
          <a href="/leaderboards" className="mt-4 inline-block text-blue-600 hover:underline">
            View all leaderboards
          </a>
        </div>
      </div>
    </Layout>
  );
}

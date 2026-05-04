import Layout from '@/components/Layout';

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-4">
            By using WageCrunch, you agree to these terms. WageCrunch provides salary and cost-of-living data for informational purposes only.
          </p>
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Use of Data</h2>
          <p className="text-gray-600 mb-4">
            All salary data is sourced from the Bureau of Labor Statistics (BLS) Occupational Employment and Wage Statistics (OEWS) program. Data is updated annually.
          </p>
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Disclaimer</h2>
          <p className="text-gray-600 mb-4">
            WageCrunch makes no warranties about the accuracy or completeness of the information provided. This data should not be used as the sole basis for financial decisions.
          </p>
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Contact</h2>
          <p className="text-gray-600">
            For questions about these terms, please visit our <a href="/contact" className="text-blue-600 hover:underline">contact page</a>.
          </p>
        </div>
      </div>
    </Layout>
  );
}
